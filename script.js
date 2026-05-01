gsap.registerPlugin(ScrollTrigger);


// ===== SMOOTH SCROLL FIX =====
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
  anchor.addEventListener("click", function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior:"smooth"
    });
  });
});


// ===== CURSOR =====
const cursor=document.querySelector(".cursor");
const blur=document.querySelector(".cursor-blur");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  blur.style.left=e.clientX-30+"px";
  blur.style.top=e.clientY-30+"px";
});


// ===== HERO ANIMATION =====
gsap.from(".hero-title",{
  y:80,
  opacity:0,
  duration:1.2,
  ease:"power3.out"
});


// ===== TEXT REVEAL =====
gsap.utils.toArray(".reveal-text").forEach(el=>{
  gsap.to(el,{
    scrollTrigger:{
      trigger:el,
      start:"top 80%"
    },
    opacity:1,
    y:0,
    duration:1
  });
});


// ===== SECTION ZOOM =====
gsap.utils.toArray(".zoom").forEach(section=>{
  gsap.from(section,{
    scale:0.95,
    opacity:0,
    scrollTrigger:{
      trigger:section,
      start:"top 80%"
    }
  });
});


// ===== SCROLL PINNING HERO =====
ScrollTrigger.create({
  trigger:".hero",
  start:"top top",
  end:"+=100%",
  pin:true,
  scrub:true
});


// ===== PROJECT TILT =====
document.querySelectorAll(".project-card").forEach(card=>{
  card.addEventListener("mousemove",(e)=>{
    const r=card.getBoundingClientRect();

    card.style.transform=`
      perspective(1000px)
      rotateX(${-(e.clientY-r.top-r.height/2)/10}deg)
      rotateY(${(e.clientX-r.left-r.width/2)/10}deg)
    `;
  });

  card.addEventListener("mouseleave",()=>{
    card.style.transform="rotateX(0) rotateY(0)";
  });
});
