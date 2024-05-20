import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Setup scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 50, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 20, 0);
controls.update();

// Clock
const clock = new THREE.Clock();

// Mixers
let mixer;
let mixer1;
let mixer2;

// Plane 
const planeGeo = new THREE.PlaneGeometry(300, 300, 10, 10);
const planeMat = new THREE.MeshPhongMaterial({ color: 0x638f32 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Light
const ambientLight = new THREE.AmbientLight(0x88939e, 0.8);
scene.add(ambientLight);
const dLight = new THREE.DirectionalLight(0x47596b, 4);
scene.add(dLight);
dLight.position.set(4, 10, 3);

// Environment
const forestLoader = new GLTFLoader();
forestLoader.load('resources/Environment.glb', (forest) => {
    const forestModel = forest.scene;
    scene.add(forestModel);
    forestModel.scale.set(30, 30, 30);
    forestModel.position.set(0, -15, 0);
});

// Stag1
const stagLoader = new GLTFLoader();
stagLoader.load('resources/Stag.glb', (stag) => {
    const model = stag.scene;
    scene.add(model);
    model.scale.set(5, 5, 5);
    model.position.set(30, 3, 40);
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const clips = stag.animations;
    mixer = new THREE.AnimationMixer(model);

    const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
    const eatingAction = mixer.clipAction(eatingClip);
    eatingAction.play();
});

// Stag2 (walk)
let walkModel;
const stagWalkLoader = new GLTFLoader();
stagWalkLoader.load('resources/Stag.glb', (stagWalk) => {
    walkModel = stagWalk.scene;
    scene.add(walkModel);
    walkModel.scale.set(5, 5, 5);
    walkModel.position.set(-30, 3, -40);
    walkModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const walkClips = stagWalk.animations;
    mixer1 = new THREE.AnimationMixer(walkModel);

    const walkClip = THREE.AnimationClip.findByName(walkClips, "Walk");
    const walkAction = mixer1.clipAction(walkClip);
    walkAction.play();
});

// Adventurer
const adventurerLoader = new GLTFLoader();
let adventurerModel, adventurerActions, activeAction, previousAction;
adventurerLoader.load('resources/Adventurer.glb', (adventurer) => {
    adventurerModel = adventurer.scene;
    scene.add(adventurerModel);
    adventurerModel.scale.set(15, 15, 15);
    adventurerModel.position.set(5, 3.5, 0);
    adventurerModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const clips = adventurer.animations;
    mixer2 = new THREE.AnimationMixer(adventurerModel);
    adventurerActions = {
        'idle': mixer2.clipAction(THREE.AnimationClip.findByName(clips, "CharacterArmature|Idle")),
        'walk': mixer2.clipAction(THREE.AnimationClip.findByName(clips, "CharacterArmature|Walk")),
        'run': mixer2.clipAction(THREE.AnimationClip.findByName(clips, "CharacterArmature|Run")),
        'attack': mixer2.clipAction(THREE.AnimationClip.findByName(clips, "CharacterArmature|Attack"))
    };

    activeAction = adventurerActions['idle'];
    activeAction.play();
});

// Switch animation function
function switchAnimation(newAction) {
    if (newAction !== activeAction) {
        previousAction = activeAction;
        activeAction = newAction;
        previousAction.fadeOut(0.5);
        activeAction.reset().fadeIn(0.5).play();
    }
}

// Event listeners
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            switchAnimation(adventurerActions['walk']);
            break;
        case 'Shift':
            switchAnimation(adventurerActions['run']);
            break;
        case 'a':
        case 's':
        case 'd':
            switchAnimation(adventurerActions['walk']);
            break;
        case ' ':
            switchAnimation(adventurerActions['attack']);
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') {
        switchAnimation(adventurerActions['idle']);
    }
    if (event.key === 'Shift') {
        switchAnimation(adventurerActions['idle']);
    }
});

// Others
scene.fog = new THREE.Fog(0x88939e, 100, 250);
let stagSpeed = 0.1;
let rotateStag = false;

// Resize
window.addEventListener("resize", () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

// Animation loop
function animate() {
    renderer.setClearColor(0x88939e);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (mixer1) mixer1.update(delta);
    if (mixer2) mixer2.update(delta);

    if (walkModel) {
        walkModel.position.z += stagSpeed;
        if (walkModel.position.z >= 1) {
            rotateStag = true;
            stagSpeed *= -1;
        } else if (walkModel.position.z < -40) {
            rotateStag = false;
            stagSpeed *= -1;
        }
        if (rotateStag) {
            if (walkModel.rotation.y <= Math.PI) {
                walkModel.rotation.y += 0.025;
            }
        } else {
            if (walkModel.rotation.y >= 0) {
                walkModel.rotation.y -= 0.025;
            }
        }
    }
}
requestAnimationFrame(animate);
