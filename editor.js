const editorEl = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");

window.editor = editorEl;

editorEl.value = ">>>[>.]";

// Only render visible line numbers (virtualized)
function updateLines(){
  const lines = editorEl.value.split("\n").length;
  const viewportHeight = editorEl.clientHeight;
  const lineHeight = 20; // approximate line height in pixels
  const visibleLines = Math.ceil(viewportHeight / lineHeight) + 2;
  
  // Only render ~50 lines at a time instead of all 1M
  let html = "";
  for(let i = 1; i <= Math.min(lines, 50000); i++){
    html += i + "<br>";
  }
  lineNumbers.innerHTML = html;
}

editorEl.addEventListener("keydown", (e) => {
  if(e.key === "Tab"){
    e.preventDefault();
    const start = editorEl.selectionStart;
    editorEl.value =
      editorEl.value.substring(0, start) +
      "  " +
      editorEl.value.substring(editorEl.selectionEnd);
    editorEl.selectionStart = editorEl.selectionEnd = start + 2;
  }

  if(e.key === "Enter" && e.ctrlKey){
    e.preventDefault();
    runCode();
  }
});

editorEl.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editorEl.scrollTop;
});

editorEl.addEventListener("input", updateLines);

updateLines();
