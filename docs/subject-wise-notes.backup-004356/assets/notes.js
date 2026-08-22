document.addEventListener("DOMContentLoaded",function(){const table=document.querySelector(".notes-table");if(!table)return;const rows=table.querySelectorAll("tbody tr");const btn=document.createElement("button");btn.className="button";btn.textContent="Practice Mode";table.parentNode.parentNode.insertBefore(btn,table.parentNode);let practice=false;
table.addEventListener("click",function(e){
if(practice&&e.target.matches(".notes-table td:nth-child(2)")){
e.target.classList.toggle("revealed");
}});
btn.addEventListener("click",function(){practice=!practice;
btn.textContent=practice?"Reading Mode":"Practice Mode";
document.querySelectorAll(".notes-table tbody td:nth-child(2)").forEach(function(cell){cell.classList.toggle("practice-answer",practice);});
});
});
