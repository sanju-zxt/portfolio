gsap.registerPlugin(ScrollTrigger);


// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
  anchor.addEventListener("click", function(e){
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior:"smooth"
    });
  });
});


// ===== CURSOR TRAIL =====
const cursor = document.querySelector(".cursor");
const trail = document.querySelector(".trail");

document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";

  trail.style.left=e.clientX-20+"px";
  trail.style.top=e.clientY-20+"px";
});


// ===== MAGNETIC BUTTON =====
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


// ===== GSAP SCROLL =====
gsap.from(".section",{
  scrollTrigger:{
    trigger:".section",
    start:"top 80%"
  },
  opacity:0,
  y:50,
  stagger:0.2
});


// ===== THREE.JS BACKGROUND =====
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


// ===== LIQUID BLOBS =====
const geometry = new THREE.IcosahedronGeometry(10,4);
const material = new THREE.MeshStandardMaterial({
  color:0x7c5cff,
  wireframe:true
});

const blob = new THREE.Mesh(geometry,material);
scene.add(blob);

const light = new THREE.PointLight(0xffffff);
light.position.set(20,20,20);
scene.add(light);


// ===== ANIMATION LOOP =====
function animate(){
  requestAnimationFrame(animate);

  blob.rotation.x +=0.002;
  blob.rotation.y +=0.003;

  // "liquid wobble"
  geometry.verticesNeedUpdate = true;

  renderer.render(scene,camera);
}

animate();


// ===== RESIZE =====
window.addEventListener("resize",()=>{
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});
