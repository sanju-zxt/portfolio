function scrollToSection(id){
  const el = document.getElementById(id);
  if(el){
    el.scrollIntoView({ behavior:"smooth" });
  }
}

function openProject(url){
  window.open(url, "_blank");
}

// NAV FIX
document.querySelectorAll("a[href^='#']").forEach(link=>{
  link.addEventListener("click", function(e){
    const target = document.querySelector(this.getAttribute("href"));
    if(target){
      e.preventDefault();
      target.scrollIntoView({ behavior:"smooth" });
    }
  });
});

// CURSOR
const cursor = document.querySelector(".cursor");
const blur = document.querySelector(".cursor-blur");

if(cursor && blur){
  document.addEventListener("mousemove",(e)=>{
    cursor.style.left=e.clientX+"px";
    cursor.style.top=e.clientY+"px";

    blur.style.left=(e.clientX-20)+"px";
    blur.style.top=(e.clientY-20)+"px";
  });
}

// TYPE TEXT
const el = document.getElementById("typeText");
if(el){
  const text = "Lohith Sanju";
  let i = 0;

  function type(){
    if(i < text.length){
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(type,80);
    }
  }
  type();
}
