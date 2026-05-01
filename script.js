document.addEventListener("DOMContentLoaded", function(){

  const container = document.getElementById("projects-container");

  const projects = [
    {
      name: "Smart Dashboard",
      desc: "Real-time student monitoring system",
      link: "https://github.com/sanju-zxt"
    },
    {
      name: "FraudShield AI",
      desc: "AI-based fraud detection system",
      link: "https://github.com/sanju-zxt"
    },
    {
      name: "Vision Bridge",
      desc: "Innovation platform",
      link: "https://github.com/sanju-zxt"
    }
  ];

  projects.forEach(p=>{
    const div = document.createElement("div");
    div.className="project";

    div.innerHTML=`
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <a href="${p.link}" target="_blank">View Project →</a>
    `;

    container.appendChild(div);
  });

});
