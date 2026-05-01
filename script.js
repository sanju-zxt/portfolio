
/* ===== TYPING ANIMATION ===== */
const roles = [
  "Full Stack Developer",
  "AI Developer",
  "Data Engineer"
];

let i = 0;
let j = 0;
let current = "";
let isDeleting = false;

function type(){
  const el = document.getElementById("typed");

  if(!el) return;

  if(i < roles.length){
    if(!isDeleting && j <= roles[i].length){
      current = roles[i].substring(0,j++);
    }else if(isDeleting && j >= 0){
      current = roles[i].substring(0,j--);
    }

    el.innerHTML = current;

    if(j === roles[i].length){
      isDeleting = true;
      setTimeout(type,1000);
      return;
    }

    if(j === 0){
      isDeleting = false;
      i++;
    }
  }else{
    i = 0;
  }

  setTimeout(type, isDeleting ? 50 : 100);
}

type();


/* ===== PARALLAX EFFECT ===== */
window.addEventListener("scroll",()=>{
  const scrollY = window.scrollY;
  const hero = document.querySelector(".hero");

  if(hero){
    hero.style.transform = `translateY(${scrollY * 0.1}px)`;
  }
});
