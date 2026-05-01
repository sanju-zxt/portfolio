gsap.registerPlugin(ScrollTrigger);


// ===== NAV FIX =====
function scrollToSection(id){
  document.getElementById(id).scrollIntoView({
    behavior:"smooth"
  });
}


// ===== PROJECT LINKS FIX =====
function openProject(url){
  window.open(url,"_blank");
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


// ===== GLSL-LIKE LIQUID BACKGROUND =====
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

const geometry = new THREE.SphereGeometry(10,64,64);
const material = new THREE.MeshStandardMaterial({
  color:0x7c5cff,
  wireframe:false
});

const mesh = new THREE.Mesh(geometry,material);
scene.add(mesh);

const light = new THREE.PointLight(0xffffff,1);
light.position.set(20,20,20);
scene.add(light);


// ===== REAL MORPH EFFECT =====
function animate(){
  requestAnimationFrame(animate);

  const time = Date.now()*0.001;

  geometry.verticesNeedUpdate = true;

  for(let i=0;i<geometry.attributes.position.count;i++){
    let x = geometry.attributes.position.getX(i);
    let y = geometry.attributes.position.getY(i);
    let z = geometry.attributes.position.getZ(i);

    let scale = 1 + 0.2*Math.sin(time + x*0.5 + y*0.5);

    geometry.attributes.position.setXYZ(i,x*scale,y*scale,z*scale);
  }

  mesh.rotation.y +=0.002;

  renderer.render(scene,camera);
}

animate();
