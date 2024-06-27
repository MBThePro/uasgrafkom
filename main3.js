import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Player, PlayerController, ThirdPersonCamera } from "./adventurer.js";
import { Ghost, GhostController, GhostCamera } from "./ghost.js";

// Clock
const clock = new THREE.Clock();
// Mixers
let mixer, mixer1, mixer2;
// Player
let player, ghostPlayer, mainPlayer;
// Bounding box
let stagBoundingBox = null;
let walkBoundingBox = null;
let adventurerBoundingBox = null;
let enviromentBoundingBox = [];
// Initialize bounding boxes for debugging visualization
let stagBBoxHelper, walkBBoxHelper, adventurerBBoxHelper;

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

let forestModel, childBoundingBox, childBBoxHelper;
const forestLoader = new GLTFLoader();
forestLoader.load("resources/Environment.glb", function (forest) {
  forestModel = forest.scene;
  forestModel.scale.set(30, 30, 30);
  forestModel.position.set(0, -15, 0);

  forestModel.traverse((child) => {
    if (child.isMesh) {
      
      child.castShadow = true;
      child.receiveShadow = true;

      // Create bounding box helper
      childBoundingBox = new THREE.Box3().setFromObject(child);
      childBoundingBox.min.multiply(forestModel.scale);
      childBoundingBox.max.multiply(forestModel.scale);
      childBoundingBox.min.add(forestModel.position);
      childBoundingBox.max.add(forestModel.position);
      childBBoxHelper = new THREE.Box3Helper(childBoundingBox, 0xff0000);
      // enviromentBoundingBox.push(childBoundingBox)
      scene.add(childBBoxHelper);
    }
  });

  scene.add(forestModel);
});

function createBoundingBoxHelper(
  scene,
  minX,
  maxX,
  minY,
  maxY,
  minZ,
  maxZ,
  color,
  customPosition
) {
  const sectionGeometry = new THREE.BoxGeometry(
    maxX - minX,
    maxY - minY,
    maxZ - minZ
  );

  const sectionMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
  });

  const sectionMesh = new THREE.Mesh(sectionGeometry, sectionMaterial);

  // Manually set the position if customPosition is provided
  if (customPosition) {
    sectionMesh.position.copy(customPosition);
  } else {
    sectionMesh.position.set(
      (maxX + minX) / 2,
      (maxY + minY) / 2,
      (maxZ + minZ) / 2
    );
  }

  scene.add(sectionMesh);

  const sectionBoundingBox = new THREE.Box3().setFromObject(sectionMesh);
  const sectionBBoxHelper = new THREE.Box3Helper(sectionBoundingBox, color);
  scene.add(sectionBBoxHelper);

  return sectionBBoxHelper;
}



// Stag 1
let stagModel; 
const stagLoader = new GLTFLoader();
stagLoader.load("resources/Stag.glb", function (stag) {
  stagModel = stag.scene; // Assign the loaded stag model to stagModel
  scene.add(stagModel);
  stagModel.scale.set(5, 5, 5);
  stagModel.position.set(30, 3, 40);
  stagModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  stagBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(stagBoundingBox);
  stagBBoxHelper = new THREE.Box3Helper(stagBoundingBox, 0xff0000); // Red for 
  scene.add(stagBBoxHelper);

  const clips = stag.animations;
  mixer = new THREE.AnimationMixer(stagModel); // Update the mixer with stagModel
  const eatingClip = THREE.AnimationClip.findByName(clips, "Eating");
  const eatingAction = mixer.clipAction(eatingClip);
  eatingAction.play();
});

// Stag 2 (walk)
let walkModel;
const stagWalkLoader = new GLTFLoader();
stagWalkLoader.load("resources/Stag.glb", function (stagWalk) {
  walkModel = stagWalk.scene;
  console.log(walkModel);
  walkModel.transparent = true;
  walkModel.opacity = 0.2;
  scene.add(walkModel);
  walkModel.scale.set(5, 5, 5);
  walkModel.position.set(-30, 3, -40);
  walkModel.traverse(function (child) {
    if (child.isMesh) {
      
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  walkBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(walkBoundingBox);
  walkBBoxHelper = new THREE.Box3Helper(walkBoundingBox, 0x00ff00); // Green for walking stag
  scene.add(walkBBoxHelper);

  const walkClips = stagWalk.animations;
  mixer1 = new THREE.AnimationMixer(walkModel);
  const walkClip = THREE.AnimationClip.findByName(walkClips, "Walk");
  const walkAction = mixer1.clipAction(walkClip);
  walkAction.play();
});

// Adventurer
const adventurerLoader = new GLTFLoader();
let adventurerModel, adventurerActions;

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

  adventurerBoundingBox = new THREE.Box3();
  adventurerBBoxHelper = new THREE.Box3Helper(adventurerBoundingBox, 0x0000ff); // Blue for adventurer
  scene.add(adventurerBBoxHelper);

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

  createPlayer();
});

function createPlayer() {
  player = new Player(
    new ThirdPersonCamera(
      camera,
      new THREE.Vector3(0, 30, -20.5),
      new THREE.Vector3(0, 30, -0.5)
    ),
    new PlayerController(),
    scene,
    10,
    adventurerModel,
    adventurerActions,
    renderer,
    enviromentBoundingBox
  );
  mainPlayer = player;
}

const ghostGeometry = new THREE.BoxGeometry(10, 20, 10);
const ghostMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
});
const ghostModel = new THREE.Mesh(ghostGeometry, ghostMaterial);


ghostModel.position.set(0, 0, 0);

function createGhostPlayer() {
  ghostPlayer = new Ghost(
    new GhostCamera(
      camera,
      new THREE.Vector3(0, 30, -20.5),
      new THREE.Vector3(0, 30, -0.5)
    ),
    new GhostController(),
    scene,
    50,
    ghostModel,
    renderer
  );
}

createGhostPlayer();

window.addEventListener("keydown", (event) => {
  if (event.key === "p") {
    if (player === ghostPlayer) {
      console.log("player");
      player = mainPlayer;
    } else {
      console.log("ghost_player");
      player = ghostPlayer;
    }
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
  if (player) {
    // Check if player is defined before updating
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

    if (walkBoundingBox) {
      walkBoundingBox.setFromObject(walkModel);
      scene.remove(walkBBoxHelper);
      walkBBoxHelper = new THREE.Box3Helper(walkBoundingBox, 0x00ff00);
      scene.add(walkBBoxHelper);
    }
  }

  if (stagBoundingBox) {
    stagBoundingBox.setFromObject(stagModel);
    scene.remove(stagBBoxHelper);
    stagBBoxHelper = new THREE.Box3Helper(stagBoundingBox, 0x00fff0);
    scene.add(stagBBoxHelper);
  }
  // Update bounding boxes and helpers for the adventurer
  if (adventurerModel && adventurerBoundingBox) {
    adventurerBoundingBox.setFromObject(adventurerModel);
    scene.remove(adventurerBBoxHelper);
    adventurerBBoxHelper = new THREE.Box3Helper(
      adventurerBoundingBox,
      0x0000ff
    );
    scene.add(adventurerBBoxHelper);
  }

}

requestAnimationFrame(animate);
