
// LOADER
window.onload = () => {
  document.getElementById("loader").style.display="none";
};

// TYPING
const roles=["P","| AI Dev","| Data Engineer"];
let i=0,j=0;

function type(){
  const el=document.getElementById("typing");
  if(!el)return;

  el.textContent=roles[i].substring(0,j++);
  if(j>roles[i].length){j=0;i=(i+1)%roles.length;}
  setTimeout(type,100);
}
type();

// CURSOR
const cursor=document.querySelector(".cursor");
const blur=document.querySelector(".cursor-blur");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  blur.style.left=e.clientX-60+"px";
  blur.style.top=e.clientY-60+"px";
});

// MAGNETIC
document.querySelectorAll(".magnetic").forEach(btn=>{
  btn.addEventListener("mousemove",e=>{
    const r=btn.getBoundingClientRect();
    btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)/5}px, ${(e.clientY-r.top-r.height/2)/5}px)`;
  });

  btn.addEventListener("mouseleave",()=>{
    btn.style.transform="translate(0,0)";
  });
});

// PARALLAX
document.addEventListener("mousemove",(e)=>{
  const bg=document.querySelector(".parallax-layer");
  if(!bg)return;
  bg.style.transform=`translate(${e.clientX/40}px,${e.clientY/40}px)`;
});

// SCROLL REVEAL
window.addEventListener("scroll",()=>{
  document.querySelectorAll(".reveal").forEach(el=>{
    if(el.getBoundingClientRect().top<window.innerHeight-100){
      el.classList.add("active");
    }
  });
});
