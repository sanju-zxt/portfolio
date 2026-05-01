// PROJECTS
const projects=[
  {name:"Smart Dashboard",desc:"Monitoring system",link:"#"},
  {name:"FraudShield AI",desc:"AI fraud detection",link:"#"},
  {name:"Vision Bridge",desc:"Innovation platform",link:"#"}
];

const container=document.getElementById("projects-container");

projects.forEach(p=>{
  const div=document.createElement("div");
  div.className="project";
  div.innerHTML=`
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
    <a href="${p.link}">View →</a>
  `;
  container.appendChild(div);
});

// CURSOR
document.addEventListener("mousemove",(e)=>{
  document.querySelector(".cursor").style.left=e.clientX+"px";
  document.querySelector(".cursor").style.top=e.clientY+"px";
});

// SCROLL
const sections=document.querySelectorAll(".section");

window.addEventListener("scroll",()=>{
  sections.forEach(sec=>{
    if(sec.getBoundingClientRect().top<window.innerHeight-100){
      sec.style.opacity=1;
      sec.style.transform="translateY(0)";
    }
  });
});
