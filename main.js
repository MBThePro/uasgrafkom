import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
  };

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
  }
  
class InputController {
    constructor(target) {
      this.target_ = target || document;
      this.initialize_();    
    }
  
    initialize_() {
      this.current_ = {
        leftButton: false,
        rightButton: false,
        mouseXDelta: 0,
        mouseYDelta: 0,
        mouseX: 0,
        mouseY: 0,
      };
      this.previous_ = null;
      this.keys_ = {};
      this.previousKeys_ = {};
      this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
      this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
      this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
      this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
      this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }
  
    onMouseMove_(e) {
      this.current_.mouseX = e.pageX - window.innerWidth / 2;
      this.current_.mouseY = e.pageY - window.innerHeight / 2;
  
      if (this.previous_ === null) {
        this.previous_ = {...this.current_};
      }
  
      this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
      this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }
  
    onMouseDown_(e) {
      this.onMouseMove_(e);
  
      switch (e.button) {
        case 0: {
          this.current_.leftButton = true;
          break;
        }
        case 2: {
          this.current_.rightButton = true;
          break;
        }
      }
    }
  
    onMouseUp_(e) {
      this.onMouseMove_(e);
  
      switch (e.button) {
        case 0: {
          this.current_.leftButton = false;
          break;
        }
        case 2: {
          this.current_.rightButton = false;
          break;
        }
      }
    }
  
    onKeyDown_(e) {
      this.keys_[e.keyCode] = true;
    }
  
    onKeyUp_(e) {
      this.keys_[e.keyCode] = false;
    }
  
    key(keyCode) {
      return !!this.keys_[keyCode];
    }
  
    isReady() {
      return this.previous_ !== null;
    }
  
    update(_) {
      if (this.previous_ !== null) {
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
  
        this.previous_ = {...this.current_};
      }
    }
  };

class FirstPersonCamera {
    constructor(camera) {
      this.camera_ = camera;
      this.input_ = new InputController();
      this.rotation_ = new THREE.Quaternion();
      this.translation_ = new THREE.Vector3(0, 30, 0);
      this.phi_ = 0;
      this.phiSpeed_ = 8;
      this.theta_ = 0;
      this.thetaSpeed_ = 5;
      this.headBobActive_ = false;
      this.headBobTimer_ = 0;
    }
  
    update(timeElapsedS) {
      this.updateRotation_(timeElapsedS);
      this.updateCamera_(timeElapsedS);
      this.updateTranslation_(timeElapsedS);
      this.updateHeadBob_(timeElapsedS);
      this.input_.update(timeElapsedS);
    }
  
    updateCamera_(_) {
      this.camera_.quaternion.copy(this.rotation_);
      this.camera_.position.copy(this.translation_);
      this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 1.5;
  
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this.rotation_);
  
      const dir = forward.clone();
  
      forward.multiplyScalar(100);
      forward.add(this.translation_);
  
      let closest = forward;
      const result = new THREE.Vector3();
      const ray = new THREE.Ray(this.translation_, dir);
    
  
      this.camera_.lookAt(closest);
    }
  
    updateHeadBob_(timeElapsedS) {
      if (this.headBobActive_) {
        const wavelength = Math.PI;
        const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
        const nextStepTime = nextStep * wavelength / 10;
        this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);
  
        if (this.headBobTimer_ == nextStepTime) {
          this.headBobActive_ = false;
        }
      }
    }
  
    updateTranslation_(timeElapsedS) {
      const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
      const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)
  
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
  
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(qx);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
  
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(qx);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
  
      this.translation_.add(forward);
      this.translation_.add(left);
  
      if (forwardVelocity != 0 || strafeVelocity != 0) {
        this.headBobActive_ = true;
      }
    }
  
    updateRotation_(timeElapsedS) {
      const xh = this.input_.current_.mouseXDelta / window.innerWidth;
      const yh = this.input_.current_.mouseYDelta / window.innerHeight;
  
      this.phi_ += -xh * this.phiSpeed_;
      this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);
  
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
      const qz = new THREE.Quaternion();
      qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
  
      const q = new THREE.Quaternion();
      q.multiply(qx);
      q.multiply(qz);
  
      this.rotation_.copy(q);
    }
  }
  
  

//clock
const clock = new THREE.Clock();
//mixer
let mixer;
let mixer1;
let mixer2;
//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Setup canvas render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Setup scene dan camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 50, 0);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 20, 0);
// controls.update();

var fpsCamera_ = new FirstPersonCamera(camera);

//enviroment
const forestLoader = new GLTFLoader();
forestLoader.load("resources/Environment.glb", function (forest) {
  const forestModel = forest.scene;
  scene.add(forestModel);
  forestModel.scale.set(30, 30, 30);
  forestModel.position.set(0, -15, 0);
});

//stag1
const stagLoader = new GLTFLoader();
stagLoader.load('resources/Stag.glb', function(stag) {
    const model = stag.scene;
    scene.add(model);
    model.scale.set(5,5,5);
    model.position.set(50,3,55);
    model.rotation.set(0,5,0);
    model.traverse( function ( child ) {
        if ( child.isMesh ) {
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
//stag2(walk)
var walkModel;
const stagWalkLoader = new GLTFLoader();
var walkModel;
stagWalkLoader.load('resources/Stag.glb', function(stagWalk) {
    walkModel = stagWalk.scene;
    scene.add(walkModel);
    walkModel.scale.set(5,5,5);
    walkModel.position.set(-60,3,-40);
    walkModel.traverse( function ( child ) {
        if ( child.isMesh ) {
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

//adventurer
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

  // Event listener, reset ke idle setelah wave, interact, death finish
  adventurerActions["wave"].clampWhenFinished = true;
  adventurerActions["wave"].loop = THREE.LoopOnce;
  adventurerActions["death"].clampWhenFinished = true;
  adventurerActions["death"].loop = THREE.LoopOnce;
  adventurerActions["interact"].clampWhenFinished = true;
  adventurerActions["interact"].loop = THREE.LoopOnce;

  mixer2.addEventListener("finished", (event) => {
    // Check which action has finished
    if (
      event.action === adventurerActions["wave"] ||
      event.action === adventurerActions["interact"]
    ) {
      switchAnimation(adventurerActions["idle"]);
    }
  });
});

function switchAnimation(newAction) {
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
};
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      switchAnimation(adventurerActions["walk"]);
      break;
    case "a":
      if (velocity.x === 0 && velocity.y === 0 && velocity.z === 0) {
        switchAnimation(adventurerActions["idle"]);
      } else {
        switchAnimation(adventurerActions["walk"]);
      }
      break;
    case "s":
      switchAnimation(adventurerActions["walk"]);
      break;
    case "d":
      if (velocity.x === 0 && velocity.y === 0 && velocity.z === 0) {
        switchAnimation(adventurerActions["idle"]);
      } else {
        switchAnimation(adventurerActions["walk"]);
      }
      break;
    case "Shift":
     if (velocity.x === 0 && velocity.y === 0 && velocity.z === 0) {
        switchAnimation(adventurerActions["idle"]);
      } else {
        switchAnimation(adventurerActions["run"]);
      };
      break;
    case " ":
      switchAnimation(adventurerActions["wave"]);
      break;
    case "x":
      switchAnimation(adventurerActions["death"]);
      break;
    default:
      switchAnimation(adventurerActions["idle"]);
  }
});

window.addEventListener("mousedown", (event) => {
  if (event.button === 2) {
    switchAnimation(adventurerActions["interact"]);
  }
});
window.addEventListener("keyup", (event) => {
  if (
    event.key === "w" ||
    event.key === "a" ||
    event.key === "s" ||
    event.key === "d"
  ) {
    switchAnimation(adventurerActions["idle"]);
  }
  if (event.key === "Shift") {
    switchAnimation(adventurerActions["idle"]);
  }
});

// Define velocity and acceleration parameters
const velocity = new THREE.Vector3(0, 0, 0);
const acceleration = new THREE.Vector3(0, 0, 0.5);
const speed = keys.Shift ? 0.0001 : 0.0002;

const rotationSpeed = 0.00005;
var damp = 0.9;

function moveAdventurer() {
  if (!adventurerModel) return;
  window.addEventListener("keydown", (event) => {
      if(event.key == "w"){
        velocity.z -= acceleration.z * speed;
        }
        if(event.key == "a"){
        velocity.x -= acceleration.x * speed;
        adventurerModel.rotation.y += rotationSpeed;
        }
        if(event.key == "s"){
       velocity.z += acceleration.z * speed;
        }
        if(event.key == "d"){
       velocity.x += acceleration.x * speed;
        adventurerModel.rotation.y -= rotationSpeed;
        }
    
  });
window.addEventListener("keyup", (event) => {
  if (
    event.key === "w" ||
    event.key === "a" ||
    event.key === "s" ||
    event.key === "d"
  ) {
    velocity.set(0,0,0);
  }
});
  velocity.multiplyScalar(damp);

  // Apply velocity and rotation to the adventurer model
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
    adventurerModel.quaternion
  );
  const sideways = new THREE.Vector3(1, 0, 0).applyQuaternion(
    adventurerModel.quaternion
  );
  const combinedVelocity = forward
    .multiplyScalar(velocity.z)
    .add(sideways.multiplyScalar(velocity.x));
  adventurerModel.position.add(combinedVelocity);
}

// Plane
var planeGeo = new THREE.PlaneGeometry(300, 300, 10, 10);
var planeMat = new THREE.MeshPhongMaterial({ color: 0x638f32 });
var plane = new THREE.Mesh(planeGeo, planeMat);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

var ambientLight = new THREE.AmbientLight(0x33414d, 4);
scene.add(ambientLight);

const dLight = new THREE.DirectionalLight(0x47596b, 8);
scene.add(dLight);
dLight.position.set(4, 10, 3);

//Others
scene.fog = new THREE.Fog(0x88939e, 100, 250);
var stagSpeed = 0.1;
var rotateStag = false;

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
        
    fpsCamera_.update(delta)
    moveAdventurer()

    walkModel.position.z += stagSpeed

    if (walkModel.position.z >= 150) {
        rotateStag = true
        stagSpeed *= -1
    } else if (walkModel.position.z < -60) {
        rotateStag = false
        stagSpeed *= -1
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
requestAnimationFrame(animate);
