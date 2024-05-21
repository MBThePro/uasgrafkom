import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Player, PlayerController, ThirdPersonCamera } from "./adventurer.js";

// Clock
const clock = new THREE.Clock();
// Mixers
let mixer, mixer1, mixer2;
// Player
let player;
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
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

// Environment
const forestLoader = new GLTFLoader();
forestLoader.load("resources/Environment.glb", function (forest) {
  const forestModel = forest.scene;
  scene.add(forestModel);
  forestModel.scale.set(30, 30, 30);
  forestModel.position.set(0, -15, 0);
});

// Stag 1
const stagLoader = new GLTFLoader();
stagLoader.load("resources/Stag.glb", function (stag) {
  const model = stag.scene;
  scene.add(model);
  model.scale.set(5, 5, 5);
  model.position.set(30, 3, 40);
  model.traverse(function (child) {
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

// Stag 2 (walk)
let walkModel;
const stagWalkLoader = new GLTFLoader();
stagWalkLoader.load("resources/Stag.glb", function (stagWalk) {
  walkModel = stagWalk.scene;
  scene.add(walkModel);
  walkModel.scale.set(5, 5, 5);
  walkModel.position.set(-30, 3, -40);
  walkModel.traverse(function (child) {
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

adventurerLoader.load("resources/Adventurer.glb", (adventurer) => {
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
    idle: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Idle")
    ),
    walk: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Walk")
    ),
    run: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Run")
    ),
    wave: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Wave")
    ),
    interact: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Interact")
    ),
    death: mixer2.clipAction(
      THREE.AnimationClip.findByName(clips, "CharacterArmature|Death")
    ),
  };

  activeAction = adventurerActions["idle"];
  activeAction.play();

  // Event listener, reset to idle after wave, interact, death finishes
  ["wave", "interact", "death"].forEach((action) => {
    adventurerActions[action].clampWhenFinished = true;
    adventurerActions[action].loop = THREE.LoopOnce;
  });

  mixer2.addEventListener("finished", (event) => {
    if (
      event.action === adventurerActions["wave"] ||
      event.action === adventurerActions["interact"]
    ) {
      switchAnimation(adventurerActions["idle"]);
    }
  });
  createPlayer();
});


function createPlayer() {
  player = new Player(
    new ThirdPersonCamera(
      camera,
      new THREE.Vector3(0, 30, -20.5),
      new THREE.Vector3(0, 30, 0)
    ),
    new PlayerController(),
    scene,
    10,
    adventurerModel 
  );
}

export function switchAnimation(newAction) {
  if (newAction !== activeAction) {
    previousAction = activeAction;
    activeAction = newAction;
    previousAction.fadeOut(0.5);
    activeAction.reset().fadeIn(0.5).play();
  }
}

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  Shift: false,
  f: false
};

function updateAnimation() {
  if (keys.Shift) {
    switchAnimation(adventurerActions["run"]);
  } else if (keys.Shift && (keys.w || keys.a || keys.s || keys.d)) {
    switchAnimation(adventurerActions["run"]);
  } else if (keys.w || keys.a || keys.s || keys.d) {
    switchAnimation(adventurerActions["walk"]);
  } else {
    switchAnimation(adventurerActions["idle"]);
  }
}
window.addEventListener("keydown", (event) => {
  if (event.key === "w") {
    keys.w = true;
  } else if (event.key === "a") {
    keys.a = true;
  } else if (event.key === "s") {
    keys.s = true;
  } else if (event.key === "d") {
    keys.d = true;
  } else if (event.key === "Shift") {
    keys.Shift = true;
  } else if (event.key === " ") {
    switchAnimation(adventurerActions["wave"]);
  } else if (event.key === "x") {
    switchAnimation(adventurerActions["death"]);
  }
  
  updateAnimation();
});

window.addEventListener("keyup", (event) => {
  if (event.key === "w") {
    keys.w = false;
  } else if (event.key === "a") {
    keys.a = false;
  } else if (event.key === "s") {
    keys.s = false;
  } else if (event.key === "d") {
    keys.d = false;
  } else if (event.key === "Shift") {
    keys.Shift = false;
  }
  updateAnimation();
});

window.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    switchAnimation(adventurerActions["interact"]);
  }
});

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


// Animate loop
function animate() {
  renderer.setClearColor(0x88939e);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (mixer1) mixer1.update(delta);
  if (mixer2) mixer2.update(delta);
  if (adventurerModel) {
    player.update(delta);
  }

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
