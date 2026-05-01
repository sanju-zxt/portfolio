function scrollToSection(id){
  document.getElementById(id).scrollIntoView({
    behavior:"smooth"
  });
}

function openProject(url){
  window.open(url,"_blank");
}
