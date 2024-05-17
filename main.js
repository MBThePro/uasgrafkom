import * as THREE from "three"
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//clock
const clock = new THREE.Clock();
//mixer
let mixer;
let mixer1;

//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
//enviroment
const forestLoader = new GLTFLoader();
forestLoader.load('resources/Environment.glb', function(forest) {
    const forestModel = forest.scene;
    scene.add(forestModel);
    forestModel.scale.set(30,30,30);
    forestModel.position.set(0,-15,0);
}); 

//stag1
const stagLoader = new GLTFLoader();
stagLoader.load('resources/Stag.glb', function(stag) {
    const model = stag.scene;
    scene.add(model);
    model.scale.set(5,5,5);
    model.position.set(30,3,40);
    model.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const clips = stag.animations;
    mixer = new THREE.AnimationMixer( model );

    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    const eatingAction = mixer.clipAction(eatingClip);
    eatingAction.play();
});

//stag2(walk)
const stagWalkLoader = new GLTFLoader();
var walkModel;
stagWalkLoader.load('resources/Stag.glb', function(stagWalk) {
    walkModel = stagWalk.scene;
    scene.add(walkModel);
    walkModel.scale.set(5,5,5);
    walkModel.position.set(-30,3,-40);
    walkModel.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const walkClips = stagWalk.animations;
    mixer1 = new THREE.AnimationMixer( walkModel );

    const walkClip = THREE.AnimationClip.findByName(walkClips, "Walk");
    const walkAction = mixer1.clipAction(walkClip);
    walkAction.play();
});

//Setup canvas render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Setup scene dan camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 1000);
camera.position.set(0,50,0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,20,0);
controls.update();



// Plane 
var planeGeo = new THREE.PlaneGeometry(300, 300, 10, 10);
var planeMat = new THREE.MeshPhongMaterial({color: 0x638f32});
var plane = new THREE.Mesh(planeGeo, planeMat); 
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


// Light
var ambientLight = new THREE.AmbientLight(0x88939e, 0.8);
scene.add(ambientLight);
const dLight = new THREE.DirectionalLight(0x47596b, 4);
scene.add(dLight);
dLight.position.set(4, 10, 3);


//Others
scene.fog = new THREE.Fog( 0x88939e, 100, 250);
var stagSpeed = 0.1
var rotateStag = false

//Resize
window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// loop animate
function animate() {
    renderer.setClearColor(0x88939e);
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if ( mixer ) mixer.update( delta )   
    if ( mixer1 ) mixer1.update( delta )   
    walkModel.position.z += stagSpeed
    if (walkModel.position.z >= 1) {
        rotateStag = true
        stagSpeed *= -1
    } else if (walkModel.position.z < -40) {
        rotateStag = false
        stagSpeed *= -1
    }
    if (rotateStag) {
        if (walkModel.rotation.y <= Math.PI) {
            walkModel.rotation.y += 0.025
        }
    } else {
        if (walkModel.rotation.y >= 0) {
            walkModel.rotation.y -= 0.025
        }
    }

    console.log(walkModel.position.z)




}
requestAnimationFrame(animate);