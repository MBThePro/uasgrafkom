import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as TWEEN from "three/addons/libs/tween.module.js";

console.clear();

let scene = new THREE.Scene();

scene.background = new THREE.Color(0xface8d);
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
camera.position.set(0, 2, 5.5);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 7;
controls.enableDamping = true;

let light = new THREE.DirectionalLight(0xffffff, Math.PI);
light.position.setScalar(1);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

scene.add(new THREE.GridHelper(10, 20));

for(let i = 0; i < 10; i++){
  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshLambertMaterial({
      color: new THREE.Color(0xface8d).multiplyScalar(0.5)
    })
  );
  mesh.position.random().subScalar(0.5).multiplyScalar(10).setY(0);
  scene.add(mesh);
}

btnZoomIn.addEventListener("click", event => {
  tween(true);
})

btnZoomOut.addEventListener("click", event => {
  tween(false);
})

function tween(inout){ // in - true, out - false
  
  let desiredDistance = inout ? controls.minDistance : controls.maxDistance;
  
  let dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.negate();
  let dist = controls.getDistance();
  
  new TWEEN.Tween({val: dist})
    .to({val: desiredDistance}, 1000)
    .onUpdate(val => {
      camera.position.copy(controls.target).addScaledVector(dir, val.val);
    })
    .start();
}


renderer.setAnimationLoop(() => {
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
});