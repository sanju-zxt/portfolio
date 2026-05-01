// SCROLL
function scrollToSection(id){
  document.getElementById(id).scrollIntoView({
    behavior:"smooth"
  });
}

// PROJECT LINKS
function openProject(url){
  window.open(url,"_blank");
}

// CURSOR
const cursor = document.querySelector(".cursor");
const blur = document.querySelector(".cursor-blur");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  blur.style.left=e.clientX-20+"px";
  blur.style.top=e.clientY-20+"px";
});

// TYPE EFFECT
const text = "Lohith Sanju";
let i = 0;

function type(){
  if(i < text.length){
    document.getElementById("typeText").innerHTML += text.charAt(i);
    i++;
    setTimeout(type,80);
  }
}
type();

// MAGNETIC BUTTON
document.querySelectorAll(".magnetic").forEach(btn=>{
  btn.addEventListener("mousemove",(e)=>{
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;

    btn.style.transform=`translate(${x*0.2}px, ${y*0.2}px)`;
  });

  btn.addEventListener("mouseleave",()=>{
    btn.style.transform="translate(0,0)";
  });
});

// SMOOTH NAV FIX
document.querySelectorAll("a[href^='#']").forEach(anchor=>{
  anchor.addEventListener("click", function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior:"smooth"
    });
  });
});