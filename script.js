// SCROLL REVEAL
const reveals=document.querySelectorAll(".reveal");

window.addEventListener("scroll",()=>{
  reveals.forEach(el=>{
    const top=el.getBoundingClientRect().top;
    if(top<window.innerHeight-100){
      el.classList.add("active");
    }
  });
});

// 3D TILT
document.querySelectorAll(".tilt").forEach(card=>{
  card.addEventListener("mousemove",(e)=>{
    let x=e.offsetX;
    let y=e.offsetY;
    let rotateX=-(y/10);
    let rotateY=(x/10);
    card.style.transform=`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave",()=>{
    card.style.transform="rotateX(0) rotateY(0)";
  });
});
