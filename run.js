function runCode(){
  const code = window.editor.value;
  const startTime = performance.now();
  const maxExecutionTime = 30000;
  
  try{
    const result = interpret(code, startTime, maxExecutionTime);
    document.getElementById("output").textContent = result;
  } catch(e){
    console.error("Run error:", e);
    document.getElementById("output").textContent = "Error: " + e.message;
  }
}

function interpret(code, startTime = 0, maxTime = 30000){
  let i = 0;
  // Use Map instead of plain object - more memory efficient for sparse data
  let vars = new Map();
  let output = [];  // Use array instead of string concatenation
  let iterations = 0;

  function checkTimeout(){
    iterations++;
    if(iterations % 50000 === 0){
      if(performance.now() - startTime > maxTime){
        throw new Error("Timeout");
      }
    }
  }

  function readArrows(){
    let count = 0;
    while(i < code.length && code[i] === ">"){
      count++;
      i++;
    }
    return count;
  }

  function readDots(){
    let count = 0;
    while(i < code.length && code[i] === "."){
      count++;
      i++;
    }
    return count;
  }

  function runBlock(codeSlice){
    let result = [];
    let idx = 0;

    while(idx < codeSlice.length){
      checkTimeout();
      
      if(/\s/.test(codeSlice[idx])){
        idx++;
        continue;
      }

      if(codeSlice[idx] === ">"){
        let arrows = 0;
        while(idx < codeSlice.length && codeSlice[idx] === ">"){
          arrows++;
          idx++;
        }

        // LOOP
        if(idx < codeSlice.length && codeSlice[idx] === "["){
          idx++;
          let bodyStart = idx;
          let depth = 1;
          
          while(idx < codeSlice.length && depth > 0){
            if(codeSlice[idx] === "[") depth++;
            else if(codeSlice[idx] === "]") depth--;
            idx++;
          }

          let body = codeSlice.substring(bodyStart, idx - 1);
          
          for(let j = 0; j < arrows; j++){
            checkTimeout();
            const subResult = runBlock(body);
            result.push(...subResult);
          }
        }

        // PRINT
        else if(idx < codeSlice.length && codeSlice[idx] === "."){
          let dots = 0;
          while(idx < codeSlice.length && codeSlice[idx] === "."){
            dots++;
            idx++;
          }

          if(dots === 1) result.push(String.fromCharCode(96 + arrows));
          else if(dots === 2) result.push(String.fromCharCode(64 + arrows));
          else if(dots === 3) result.push(String(arrows));
          else result.push("?");
        }

        // VAR PRINT
        else if(idx + 1 < codeSlice.length && codeSlice[idx] === "-" && codeSlice[idx+1] === ">"){
          idx += 2;
          result.push(String(vars.get(arrows) || 0));
        }
        
        // ASSIGN
        else if(idx + 2 < codeSlice.length && codeSlice[idx] === "-" && codeSlice[idx+1] === "=" && codeSlice[idx+2] === ">"){
          idx += 3;
          let value = 0;
          while(idx < codeSlice.length && codeSlice[idx] === "."){
            value++;
            idx++;
          }
          vars.set(arrows, value);
        }
        else {
          idx++;
        }
      } else {
        idx++;
      }
    }

    return result;
  }

  return runBlock(code).join("");
}
