// Main thread runner: spawns worker, handles input-requests and stopping.

let worker = null;
const runBtn = document.getElementById('runBtn');
const stopBtn = document.getElementById('stopBtn');
const outputEl = document.getElementById('output');

function clearWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

function runCode(){
  clearWorker();

  // clear output until we get a result
  outputEl.textContent = "";

  worker = new Worker('worker.js');

  worker.onmessage = function(e){
    const data = e.data;
    if (!data) return;

    if (data.type === 'result') {
      outputEl.textContent = String(data.result);
      clearWorker();
    } else if (data.type === 'error') {
      outputEl.textContent = "Error: " + String(data.message || data.error || "unknown error");
      clearWorker();
    } else if (data.type === 'input-request') {
      // Show a prompt to the user and send response back to worker.
      // You can replace this with a custom UI prompt if desired.
      const promptText = (data.prompt || "").toString();
      const value = prompt(promptText === "" ? "Input:" : promptText);
      // send response (always send an object with type and id)
      worker.postMessage({ type: 'input-response', id: data.id, value: value });
    } else {
      // fallback: if worker sent a plain string/result
      if (typeof data === 'string') {
        outputEl.textContent = data;
        clearWorker();
      }
    }
  };

  worker.onerror = function(ev){
    // try to show a useful message (some browsers provide .message, .filename, .lineno)
    const msg = ev && (ev.message || ev.error && ev.error.message) ? (ev.message || ev.error.message) : "Worker error";
    outputEl.textContent = "Error: " + msg;
    clearWorker();
  };

  const code = window.editor.value;
  // Post the code string to the worker (worker will run interpret)
  worker.postMessage(code);
}

runBtn.addEventListener('click', runCode);

stopBtn.addEventListener('click', () => {
  if(worker){
    worker.terminate();
    worker = null;
    outputEl.textContent = "Execution terminated.";
  }
});
