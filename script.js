// GITHUB API
fetch("https://api.github.com/users/sanju-zxt/repos")
.then(res=>res.json())
.then(data=>{
  const container=document.getElementById("projects-container");

  data.slice(0,3).forEach(repo=>{
    const div=document.createElement("div");
    div.className="project";

    div.innerHTML=`
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description"}</p>
      <a href="${repo.html_url}" target="_blank">View →</a>
    `;

    container.appendChild(div);
  });
});

// CURSOR
document.addEventListener("mousemove",(e)=>{
  document.querySelector(".cursor").style.left=e.clientX+"px";
});

// MAGNETIC BUTTON
document.querySelectorAll(".magnetic").forEach(btn=>{
  btn.addEventListener("mousemove",(e)=>{
    const rect=btn.getBoundingClientRect();
    const x=e.clientX-rect.left-rect.width/2;
    const y=e.clientY-rect.top-rect.height/2;
    btn.style.transform=`translate(${x*0.2}px,${y*0.2}px)`;
  });

  btn.addEventListener("mouseleave",()=>{
    btn.style.transform="translate(0,0)";
  });
});

// POPUP
function openPopup(file){
  document.getElementById("popup").style.display="block";
  document.getElementById("pdfViewer").src=file;
}

function closePopup(){
  document.getElementById("popup").style.display="none";
}
