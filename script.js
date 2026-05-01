gsap.registerPlugin(ScrollTrigger);


// ===== SCROLL FIX =====
function scrollToSection(id){
  document.getElementById(id).scrollIntoView({
    behavior:"smooth"
  });
}


// ===== CURSOR =====
const cursor = document.querySelector(".cursor");
const trail = document.querySelector(".trail");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  trail.style.left=e.clientX-12+"px";
  trail.style.top=e.clientY-12+"px";
});


// ===== MAGNETIC =====
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


// ===== SCROLL ANIMATION =====
gsap.from(".section",{
  scrollTrigger:{
    trigger:".section",
    start:"top 85%"
  },
  opacity:0,
  y:60,
  duration:1,
  stagger:0.2
});


// ===== THREE.JS (LIQUID STYLE) =====
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas:document.querySelector("#bg"),
  alpha:true
});

renderer.setSize(window.innerWidth,window.innerHeight);
camera.position.z=30;

const geometry = new THREE.IcosahedronGeometry(10,4);
const material = new THREE.MeshStandardMaterial({
  color:0x7c5cff,
  wireframe:true
});

const mesh = new THREE.Mesh(geometry,material);
scene.add(mesh);

const light = new THREE.PointLight(0xffffff);
light.position.set(20,20,20);
scene.add(light);


// ===== ANIMATION =====
function animate(){
  requestAnimationFrame(animate);

  mesh.rotation.x +=0.002;
  mesh.rotation.y +=0.003;

  renderer.render(scene,camera);
}

animate();
