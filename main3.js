import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Player, PlayerController, ThirdPersonCamera } from "./adventurer.js";
import { Ghost, GhostController, GhostCamera } from "./ghost.js";

// Clock
const clock = new THREE.Clock();
// Mixers
let mixer, mixer1, mixer2, mixer3, mixer4, mixer5, mixer6;
// Player
let player, ghostPlayer, mainPlayer;
// Bounding box
let stagBoundingBox = null;
let walkBoundingBox = null;
let foxBoundingBox = null;
let deerBoundingBox = null;
let wolfBoundingBox = null;
let adventurerBoundingBox = null;
let rvBoundingBox = null;
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
  forestModel.scale.set(15, 15, 15);
  forestModel.position.set(0, -6, 0);

  forestModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // console.log(child.parent)

      // Create bounding box helper
      childBoundingBox = new THREE.Box3().setFromObject(child);
      childBoundingBox.min.multiply(forestModel.scale);
      childBoundingBox.max.multiply(forestModel.scale);
      childBoundingBox.min.add(forestModel.position);
      childBoundingBox.max.add(forestModel.position);
      childBBoxHelper = new THREE.Box3Helper(childBoundingBox, 0xff0000);

      // console.log(childBoundingBox.max.x)
      // if (childBoundingBox.max.x == 3.9582591271027923) {
        console.log(child.parent.name)
      // }
      // console.log(child)

      // scene.add(childBBoxHelper)

      if (child.parent.name.includes("Tree"))
        childBoundingBox.expandByScalar(-10);
      if (child.parent.name.includes("WoodLog"))
        childBoundingBox.expandByScalar(-1.9);
      if (child.parent.name.includes("Tent"))
        childBoundingBox.expandByScalar(-9);
        if (child.name.includes("Resource_Rock_1"))
        childBoundingBox.expandByScalar(-6);
      // if (child.parent.name.includes("Guitar")) child.position.y -= 0.1

      if (
        !(child.parent.name == "grasses" || child.parent.name.includes("rocks")|| child.parent.name.includes("Guitar1"))
      )
        enviromentBoundingBox.push(childBoundingBox);
      scene.add(childBBoxHelper);
    }
  });

  scene.add(forestModel);
});

// Campfire
const campfireLoader = new GLTFLoader();
campfireLoader.load("resources/Campfire.glb", function (campfire) {
  const campfireModel = campfire.scene;
  scene.add(campfireModel);
  campfireModel.scale.set(5, 5, 5);
  campfireModel.position.set(7, 5, 53);
  campfireModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  var pointLight = new THREE.PointLight(0xffff11, 200);
  campfireModel.add(pointLight);
});

// Lampu1
const lampu1Loader = new GLTFLoader();
lampu1Loader.load("resources/Lantern.glb", function (lampu1) {
  const lampu1Model = lampu1.scene;
  scene.add(lampu1Model);
  lampu1Model.scale.set(10, 10, 10);
  lampu1Model.position.set(0, 15, -120);
  lampu1Model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  var pointLantern1 = new THREE.PointLight(0xffff11, 100);
  lampu1Model.add(pointLantern1);
});

// Lampu2
const lampu2Loader = new GLTFLoader();
lampu2Loader.load("resources/Lantern.glb", function (lampu2) {
  const lampu2Model = lampu2.scene;
  scene.add(lampu2Model);
  lampu2Model.scale.set(10, 10, 10);
  lampu2Model.position.set(-40, 15, -120);
  lampu2Model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  var pointLantern2 = new THREE.PointLight(0xffff11, 100);
  lampu2Model.add(pointLantern2);
});

// Stag 1
let stagModel;
const stagLoader = new GLTFLoader();
stagLoader.load("resources/Stag.glb", function (stag) {
  stagModel = stag.scene; // Assign the loaded stag model to stagModel
  scene.add(stagModel);
  stagModel.scale.set(3, 3, 3);
  stagModel.position.set(15, 3, 20);
  stagModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  stagBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(stagBoundingBox);
  // stagBBoxHelper = new THREE.Box3Helper(stagBoundingBox, 0xff0000); // Red for
  // scene.add(stagBBoxHelper);

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
  walkModel.transparent = true;
  walkModel.opacity = 0.2;
  scene.add(walkModel);
  walkModel.scale.set(3, 3, 3);
  walkModel.position.set(-30, 3, -40);
  walkModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  walkBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(walkBoundingBox);
  // walkBBoxHelper = new THREE.Box3Helper(walkBoundingBox, 0x00ff00); // Green for walking stag
  // scene.add(walkBBoxHelper);

  const walkClips = stagWalk.animations;
  mixer1 = new THREE.AnimationMixer(walkModel);
  const walkClip = THREE.AnimationClip.findByName(walkClips, "Walk");
  const walkAction = mixer1.clipAction(walkClip);
  walkAction.play();
});

//Fox
let foxModel;
const foxLoader = new GLTFLoader();
foxLoader.load("resources/Fox.glb", function (fox) {
  foxModel = fox.scene; // Assign the loaded fox model to foxModel
  scene.add(foxModel);
  foxModel.scale.set(3, 3, 3);
  foxModel.position.set(15, 3, 180);
  foxModel.rotation.y = THREE.MathUtils.degToRad(90)
  foxModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  foxBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(foxBoundingBox);
  // foxBBoxHelper = new THREE.Box3Helper(foxBoundingBox, 0xff0000); // Red for
  // scene.add(foxBBoxHelper);

  const foxClips = fox.animations;
  mixer3 = new THREE.AnimationMixer(foxModel); // Update the mixer with foxModel
  const idleClip = THREE.AnimationClip.findByName(
    foxClips,
    "Gallop"
  );
    const idleAction = mixer3.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopRepeat);
    idleAction.play();

});


//germanShepard
let germanShepardModel;
const germanShepardLoader = new GLTFLoader();
germanShepardLoader.load("resources/German_Shepard.glb", function (germanShepard) {
  germanShepardModel = germanShepard.scene; // Assign the loaded germanShepard model to germanShepardModel
  scene.add(germanShepardModel);
  germanShepardModel.scale.set(7, 7, 7);
  germanShepardModel.position.set(2, 3,72);
  germanShepardModel.rotation.y = THREE.MathUtils.degToRad(165)
  germanShepardModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const germanShepardClips = germanShepard.animations;
  if (germanShepardClips.length === 0) {
    console.error("No animations found in German_Shepard.glb");
    return;
  }

  mixer4 = new THREE.AnimationMixer(germanShepardModel); // Update the mixer with germanShepardModel
  const idleClip = THREE.AnimationClip.findByName(germanShepardClips, "Idle_2");
  
  if (!idleClip) {
    console.error("Idle_2 animation clip not found in German_Shepard.glb");
    return;
  }
  
  const idleGermanAction = mixer4.clipAction(idleClip);
  idleGermanAction.setLoop(THREE.LoopRepeat);
  idleGermanAction.play();
});



// Adventurer
const adventurerLoader = new GLTFLoader();
let adventurerModel, adventurerActions;

adventurerLoader.load("resources/Adventurer.glb", (adventurer) => {
  adventurerModel = adventurer.scene;
  scene.add(adventurerModel);
  adventurerModel.scale.set(8, 8, 8);
  adventurerModel.position.set(5, 3.4, 10);
  adventurerModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  adventurerBoundingBox = new THREE.Box3();
  // adventurerBBoxHelper = new THREE.Box3Helper(adventurerBoundingBox, 0x0000ff); // Blue for adventurer
  // scene.add(adventurerBBoxHelper);

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

// Kaca 1
const kaca1 = new THREE.BoxGeometry(7.5, 9, 1);
const kacaMaterial1 = new THREE.MeshPhysicalMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.2,
});
kacaMaterial1.transmission = 1.0;
kacaMaterial1.roughness = 0.0;
const cube1 = new THREE.Mesh(kaca1, kacaMaterial1);
cube1.position.set(-6, 16, -137);
cube1.castShadow = true;
cube1.receiveShadow = true;
scene.add(cube1);

const kaca2 = new THREE.BoxGeometry(7.5, 9, 1);
const kacaMaterial2 = new THREE.MeshPhysicalMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.2,
});
kacaMaterial2.transmission = 1.0;
kacaMaterial2.roughness = 0.0;
const cube2 = new THREE.Mesh(kaca2, kacaMaterial2);
cube2.position.set(-33, 16, -137);
cube2.castShadow = true;
cube2.receiveShadow = true;
scene.add(cube2);

const kaca3 = new THREE.BoxGeometry(7.5, 9, 1);
const kacaMaterial3 = new THREE.MeshPhysicalMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.2,
});
const cube3 = new THREE.Mesh(kaca3, kacaMaterial3);
cube3.position.set(-6, 16, -168);
scene.add(cube3);

const kaca4 = new THREE.BoxGeometry(7.5, 9, 1);
const kacaMaterial4 = new THREE.MeshPhysicalMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.2,
});
const cube4 = new THREE.Mesh(kaca4, kacaMaterial4);
cube4.position.set(-33, 16, -168);
scene.add(cube4);

const kaca5 = new THREE.BoxGeometry(7.5, 9, 1);
const kacaMaterial5 = new THREE.MeshPhysicalMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.2,
});
const cube5 = new THREE.Mesh(kaca5, kacaMaterial5);
cube5.position.set(2.8, 16, -152.5);
cube5.rotation.set(0, Math.PI / 2, 0);
scene.add(cube5);

const bottle = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
const bottleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00ffff,
  transmission: 1.0,
  roughness: 0,
  ior: 1.7,
  thickness: 0.2,
  specularIntensity: 1.0,
  clearcoat: 1,
});
const waterBottle = new THREE.Mesh(bottle, bottleMaterial);
waterBottle.position.set(0, 0, 68);
scene.add(waterBottle);

const bottleTop = new THREE.CylinderGeometry(0.25, 0.5, 1, 8);
const bottleTopMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00ffff,
  transmission: 1.0,
  roughness: 0,
  ior: 1.7,
  thickness: 0.2,
  specularIntensity: 1.0,
  clearcoat: 1,
});
const waterBottleTop = new THREE.Mesh(bottleTop, bottleTopMaterial);
waterBottleTop.position.set(0, 5.5, 68);
scene.add(waterBottleTop);

const bottleCap = new THREE.CylinderGeometry(0.25, 0.25, 0.25, 8);
const bottleCapMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color(1, 1, 1),
});
const waterBottleCap = new THREE.Mesh(bottleCap, bottleCapMaterial);
waterBottleCap.position.set(0, 6.25, 68);
scene.add(waterBottleCap);

// Deer dead
let deerDeadModel;
const deerLoader = new GLTFLoader();
deerLoader.load("resources/Deer.glb", function (deer) {
  deerDeadModel = deer.scene; // Assign the loaded fox model to foxModel
  scene.add(deerDeadModel);
  deerDeadModel.scale.set(3, 3, 3);
  deerDeadModel.position.set(50, 3, 0);
  deerDeadModel.rotation.y = THREE.MathUtils.degToRad(0)
  deerDeadModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  deerBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push(deerBoundingBox);
  // foxBBoxHelper = new THREE.Box3Helper(foxBoundingBox, 0xff0000); // Red for
  // scene.add(foxBBoxHelper);

  const deerClips = deer.animations;
  mixer5 = new THREE.AnimationMixer(deerDeadModel); // Update the mixer with foxModel
  const idleClip = THREE.AnimationClip.findByName(
    deerClips,
    "Death"
  );
    const idleAction = mixer5.clipAction(idleClip);
    idleAction.clampWhenFinished = true
    idleAction.loop = THREE.LoopOnce
    idleAction.play();

});

// Wolf eat
let wolfEatModel;
const wolfLoader = new GLTFLoader();
wolfLoader.load("resources/Wolf.glb", function (wolf) {
  wolfEatModel = wolf.scene; // Assign the loaded fox model to foxModel
  scene.add(wolfEatModel);
  wolfEatModel.scale.set(3, 3, 3);
  wolfEatModel.position.set(63, 3, 0);
  wolfEatModel.rotation.y = THREE.MathUtils.degToRad(270)
  wolfEatModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  wolfBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push( wolfBoundingBox);
  // foxBBoxHelper = new THREE.Box3Helper(foxBoundingBox, 0xff0000); // Red for
  // scene.add(foxBBoxHelper);

  const deerClips = wolf.animations;
  mixer6 = new THREE.AnimationMixer(wolfEatModel); // Update the mixer with foxModel
  const idleClip = THREE.AnimationClip.findByName(
    deerClips,
    "Eating"
  );
    const idleAction = mixer6.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopRepeat);
    idleAction.play();

});

// RV
let rvModel;
const rvLoader = new GLTFLoader();
rvLoader.load("resources/RV.glb", function (RV) {
  rvModel = RV.scene; // Assign the loaded RV model to rvModel
  rvModel.scale.set(12, 12, 12);
  rvModel.position.set(10, -5, -70);
  rvModel.rotation.y = THREE.MathUtils.degToRad(0);
  rvModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Add the RV model to the scene
  scene.add(rvModel);

  rvBoundingBox = new THREE.Box3();
  enviromentBoundingBox.push( rvBoundingBox);

  const target = new THREE.Object3D();
  target.position.set(-30, -5, -60)
  scene.add(target)

  // Add spotlight to simulate car light
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(20, 8, -78); // Position the spotlight in front of the RV
  spotLight.angle = Math.PI / 9; // Set the angle of the spotlight
  spotLight.penumbra = 0.2; // Soft edges for the spotlight
  spotLight.decay = 0.5; // How quickly the light dims
  spotLight.distance = 50; // The maximum range of the light
  spotLight.power = 300;
  spotLight.target = target

  // Enable shadows for the spotlight
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 200;

  // Add the spotlight to the scene
  scene.add(spotLight);

  // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);
  const target1 = new THREE.Object3D();
  target1.position.set(-5, -5, -50)
  scene.add(target1)

  // Add spotlight to simulate car light
  const spotLight1 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(24, 8, -65); // Position the spotlight1 in front of the RV
  spotLight1.angle = Math.PI / 9; // Set the angle of the spotlight1
  spotLight1.penumbra = 0.2; // Soft edges for the spotlight1
  spotLight1.decay = 0.5; // How quickly the light dims
  spotLight1.distance = 50; // The maximum range of the light
  spotLight1.power = 300;
  spotLight1.target = target1

  // Enable shadows for the spotlight1
  spotLight1.castShadow = true;
  spotLight1.shadow.mapSize.width = 1024;
  spotLight1.shadow.mapSize.height = 1024;
  spotLight1.shadow.camera.near = 10;
  spotLight1.shadow.camera.far = 200;

  // Add the spotlight1 to the scene
  scene.add(spotLight1);


  // // Optionally, add a helper to visualize the spotlight
  // const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1);
  // scene.add(spotLightHelper1);
});

function createPlayer() {
  player = new Player(
    new ThirdPersonCamera(
      camera,
      new THREE.Vector3(0, 17, -15.5),
      new THREE.Vector3(0, 0, 0)
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
      new THREE.Vector3(0, 17, -15.5),
      new THREE.Vector3(0, 17, -0.5)
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
const planeGeo = new THREE.PlaneGeometry(510, 510, 10, 10);
const planeMat = new THREE.MeshPhongMaterial({ color: 0x638f32 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
plane.position.set(0, 3.2, 0);

// Daynight color
const dayColor = new THREE.Color(0x88939e);
const nightColor = new THREE.Color(0x000000);
const dayAmbientLightColor = new THREE.Color(0x88939e);
const nightAmbientLightColor = new THREE.Color(0x171515);
const dayDirectionalLightColor = new THREE.Color(0x47596b);
const nightDirectionalLightColor = new THREE.Color(0x1b1b1c);
const cycleDuration = 60; // Duration of a full day-night cycle in seconds
let cycleTime = 0;

// Light
const ambientLight = new THREE.AmbientLight(0x88939e, 0.8);
scene.add(ambientLight);

const dLight = new THREE.DirectionalLight(0x47596b, 4); // White light
dLight.position.set(0, 200, 50);
dLight.castShadow = true;
dLight.shadow.mapSize.width = 5000;
dLight.shadow.mapSize.height = 5000;
dLight.shadow.camera.near = 0.5;
dLight.shadow.camera.far = 500;
dLight.shadow.camera.left = -270;
dLight.shadow.camera.right = 270;
dLight.shadow.camera.top = 270;
dLight.shadow.camera.bottom = -270;
scene.add(dLight);

// Others
scene.fog = new THREE.Fog(0x88939e, 50, 120);
let stagSpeed = 0.1;
let foxSpeed = 0.5;
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
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (mixer1) mixer1.update(delta);
  if (mixer2) mixer2.update(delta);
  if (mixer3) mixer3.update(delta);
  if (mixer4) mixer4.update(delta);
  if (mixer5) mixer5.update(delta);
  if (mixer6) mixer6.update(delta);
  if (player) {
    // Check if player is defined before updating
    player.update(delta);
    player.camera.updateHeadBob_(delta);
    console.log(player)
  }

  // Update day-night cycle
  cycleTime += delta;
  const cycleProgress = (cycleTime % cycleDuration) / cycleDuration;
  const colorFactor = 0.5 * (1 + Math.sin(cycleProgress * 2 * Math.PI)); // Ranges from 0 to 1

  const currentFogColor = dayColor.clone().lerp(nightColor, colorFactor);
  const currentAmbientLightColor = dayAmbientLightColor.clone().lerp(nightAmbientLightColor, colorFactor);
  const currentDirectionalLightColor = dayDirectionalLightColor.clone().lerp(nightDirectionalLightColor, colorFactor);

  scene.fog.color = currentFogColor;
  renderer.setClearColor(currentFogColor);
  ambientLight.color = currentAmbientLightColor;
  dLight.color = currentDirectionalLightColor;

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
      // walkBBoxHelper = new THREE.Box3Helper(walkBoundingBox, 0x00ff00);
      // scene.add(walkBBoxHelper);
    }
  }

  if (foxModel) {
    foxModel.position.x += foxSpeed;
    if (foxModel.position.x >= 150) {
      foxSpeed *= -1;
    } else if (foxModel.position.x < -100) {
      foxSpeed *= -1;
    }
    if(foxModel.position.x >= 140 || foxModel.position.x < -100){
      foxModel.rotation.y += THREE.MathUtils.degToRad(180)
    }
    if (foxBoundingBox) {
      foxBoundingBox.setFromObject(foxModel);
    }
  }
  if (stagBoundingBox) {
    stagBoundingBox.setFromObject(stagModel);
    scene.remove(stagBBoxHelper);
    // stagBBoxHelper = new THREE.Box3Helper(stagBoundingBox, 0x00fff0);
    // scene.add(stagBBoxHelper);
  }
  // Update bounding boxes and helpers for the adventurer
  if (adventurerModel && adventurerBoundingBox) {
    adventurerBoundingBox.setFromObject(adventurerModel);
    scene.remove(adventurerBBoxHelper);
    // adventurerBBoxHelper = new THREE.Box3Helper(
    //   adventurerBoundingBox,
    //   0x0000ff
    // );
    // scene.add(adventurerBBoxHelper);
  }

  if (deerBoundingBox) {
    deerBoundingBox.setFromObject(deerDeadModel)
  }

  if (wolfBoundingBox) {
    wolfBoundingBox.setFromObject(wolfEatModel)
  }

  if (rvBoundingBox) {
    rvBoundingBox.setFromObject(rvModel)
  }
}

requestAnimationFrame(animate);
