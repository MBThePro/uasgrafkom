import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const clock = new THREE.Clock();
// setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
// setup scene and camera

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// add sun
var geometry = new THREE.SphereGeometry(1, 10, 10);
var material = new THREE.MeshPhongMaterial({ color: 0xffff33 });
var sun = new THREE.Mesh(geometry, material);
sun.castShadow = true;
sun.receiveShadow = true;
scene.add(sun);

// earth
var earthGeo = new THREE.SphereGeometry(1, 10, 10);
var earthMaterial = new THREE.MeshPhongMaterial({ color: 0x3333ff });
var earth = new THREE.Mesh(earthGeo, earthMaterial);
sun.add(earth);
earth.position.set(5, 0, 0);
earth.scale.set(0.5, 0.5, 0.5);
earth.castShadow = true;
earth.receiveShadow = true;

var moongeo = new THREE.SphereGeometry(1, 10, 10);
var moonMaterial = new THREE.MeshPhongMaterial({ color: 0x55555 });
var moon = new THREE.Mesh(moongeo, moonMaterial);
moon.position.set(5, 0, 0);
moon.scale.set(0.25, 0.25, 0.25);
moon.castShadow = true;
moon.receiveShadow = true;

const geometryPlane = new THREE.PlaneGeometry(10, 10);
const materialPlane = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.rotateX(1.54);
plane.position.set(0, -1, 0);
scene.add(plane);
plane.castShadow = true;
plane.receiveShadow = true;

new MTLLoader()
  .setPath("resources/Satellite/")
  .load("Satelite.mtl", function (materials) {
    materials.preload();

    new OBJLoader()
      .setMaterials(materials)
      .setPath("resources/Satellite/")
      .load("Satelite.obj", function (object) {
        // object.position.y = - 0.95;
        // object.scale.setScalar( 0.01 );
        earth.add(object);
        object.scale.set(0.1, 0.1, 0.1);
        object.position.set(-3, 0, 0);
        object.castShadow = true;
        object.receiveShadow = true;
      });
  });

// ambient light
// var ambientLight = new THREE.AmbientLight(0xFF9999);
// scene.add(ambientLight);

const loader = new FBXLoader();
var mixer;
loader.setPath("resources/RifleFire/");
loader.load("Rifle Aiming Idle.fbx", function (object) {
  mixer = new THREE.AnimationMixer(object);

  const action = mixer.clipAction(object.animations[0]);
  action.play();
  action.setDuration(5);

  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  object.scale.set(0.01, 0.01, 0.01);
  object.position.set(0, 1, 0);
  sun.add(object);
});

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, -10);
hemiLight.castShadow = true;
hemiLight.receiveShadow = true;
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 8);
dirLight.position.set(0, 20, -10);
dirLight.castShadow = true;
dirLight.receiveShadow = true;
scene.add(dirLight);

// loop animate
function animate() {
  renderer.render(scene, camera);

  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  sun.rotation.y += 0.01;

  earth.rotation.y += 0.01;
}
requestAnimationFrame(animate);
