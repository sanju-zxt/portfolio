// ===== PARALLAX DEPTH =====
document.addEventListener("mousemove",(e)=>{
  const layers=document.querySelectorAll(".parallax-layer");

  layers.forEach(layer=>{
    const speed = 20;
    const x = (window.innerWidth/2 - e.clientX)/speed;
    const y = (window.innerHeight/2 - e.clientY)/speed;

    layer.style.transform = `translate(${x}px, ${y}px)`;
  });
});


// ===== SCROLL REVEAL (APPLE STYLE) =====
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll",()=>{
  reveals.forEach(el=>{
    const top = el.getBoundingClientRect().top;

    if(top < window.innerHeight - 80){
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }
  });
});


// ===== PROJECT HOVER PREVIEW =====
document.querySelectorAll(".project-card").forEach(card=>{
  card.addEventListener("mousemove",e=>{
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.transform = `
      perspective(1000px)
      rotateX(${-(y-rect.height/2)/12}deg)
      rotateY(${(x-rect.width/2)/12}deg)
      scale(1.03)
    `;
  });

  card.addEventListener("mouseleave",()=>{
    card.style.transform = "rotateX(0) rotateY(0)";
  });
});
