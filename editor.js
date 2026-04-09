const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");

editor.value = ">>>[>.]";

// line numbers
function updateLines(){
  const count = editor.value.split("\n").length;
  lineNumbers.innerHTML = Array.from({length:count},(_,i)=>i+1).join("<br>");
}

// tab support
editor.addEventListener("keydown", (e)=>{
  if(e.key === "Tab"){
    e.preventDefault();
    const start = editor.selectionStart;
    editor.value =
      editor.value.substring(0,start) +
      "  " +
      editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = start + 2;
  }
});

// sync scroll
editor.addEventListener("scroll", ()=>{
  lineNumbers.scrollTop = editor.scrollTop;
});

editor.addEventListener("input", updateLines);

updateLines();
