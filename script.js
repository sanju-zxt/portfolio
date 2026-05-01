// ===== TYPING =====
const roles = ["Full Stack Developer","AI Developer","Data Engineer"];
let i=0,j=0,current="",deleting=false;

function type(){
  const el=document.getElementById("typed");

  if(!el) return;

  if(i<roles.length){
    if(!deleting && j<=roles[i].length){
      current=roles[i].substring(0,j++);
    }else if(deleting && j>=0){
      current=roles[i].substring(0,j--);
    }

    el.innerHTML=current;

    if(j===roles[i].length){
      deleting=true;
      setTimeout(type,1000);
      return;
    }

    if(j===0){
      deleting=false;
      i++;
    }
  }else{
    i=0;
  }

  setTimeout(type,deleting?50:100);
}

type();

// ===== GITHUB PROJECTS =====
fetch("https://api.github.com/users/sanju-zxt/repos")
.then(res=>res.json())
.then(data=>{
  const container=document.getElementById("projects-container");

  data.slice(0,3).forEach(repo=>{
    const div=document.createElement("div");

    div.className="project";

    div.innerHTML=`
      <h3>${repo.name}</h3>
      <p>${repo.description || "Project"}</p>
      <a href="${repo.html_url}" target="_blank">View →</a>
    `;

    container.appendChild(div);
  });
});
