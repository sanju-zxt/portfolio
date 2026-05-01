// ===== PROJECTS FIX =====
const container = document.getElementById("projects-container");

const projects = [
  {
    name: "Smart Dashboard",
    desc: "Student monitoring system",
    link: "https://github.com/sanju-zxt/smart-dashboard"
  },
  {
    name: "FraudShield AI",
    desc: "AI fraud detection",
    link: "https://github.com/sanju-zxt/FraudShieldAI"
  },
  {
    name: "Vision Bridge",
    desc: "Innovation platform",
    link: "https://github.com/sanju-zxt/vision-bridge"
  }
];

projects.forEach(p=>{
  const div=document.createElement("div");
  div.className="project";

  div.innerHTML=`
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
    <a href="${p.link}" target="_blank">View →</a>
  `;

  container.appendChild(div);
});

// ===== CURSOR GLOW =====
const cursor=document.querySelector(".cursor");
const blur=document.querySelector(".cursor-blur");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  blur.style.left=e.clientX-50+"px";
  blur.style.top=e.clientY-50+"px";
});