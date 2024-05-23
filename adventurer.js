import * as THREE from "three";

export class Player {
  constructor(camera, controller, scene, speed, adventurerModel, renderer) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.speed = speed;
    this.adventurerModel = adventurerModel;
    this.camera.setup(new THREE.Vector3(3, 0, 0), new THREE.Euler(0, 0, 0));
    this.renderer = renderer;
    this.rotationSpeed = Math.PI / 2; // Rotation speed in radians per second
    this.currentRotation = new THREE.Euler(0, 0, 0); // Current rotation angle in radians

    window.addEventListener("keydown", (event) => this.onKeyDown(event), false);
    window.addEventListener("keyup", (event) => this.onKeyUp(event), false);
  }

  onKeyDown(event) {
    if (event.key === 'z') {
      if ((this.camera.positionOffset.z+=0.5) < 0) {
        this.camera.positionOffset.z += 0.5;
        console.log(this.camera.positionOffset.z);
      } else {
        this.camera.positionOffset.z = -20.5;
      }
    }
  }

  onKeyUp(event) {
    if (event.key === 'f') {
      this.camera.positionOffset.z = -0.5;
    } else if (event.key === 't') {
      this.camera.positionOffset.z = -20.5;
    }
  }
  update(dt) {
    var direction = new THREE.Vector3(0, 0, 0);

    if (this.controller.keys["forward"]) {
      direction.z += this.speed * dt;
    }
    if (this.controller.keys["backward"]) {
      direction.z -= this.speed * dt;
    }
    if (this.controller.keys["left"]) {
      this.currentRotation.y += this.rotationSpeed * dt;
    }
    if (this.controller.keys["right"]) {
      this.currentRotation.y -= this.rotationSpeed * dt;
    }
    if (this.controller.keys["Shift"]) {
      direction.multiplyScalar(2);
    }

    // Calculate new direction based on current rotation
    const moveDirection = new THREE.Vector3(Math.sin(this.currentRotation.y), 0, Math.cos(this.currentRotation.y));
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentRotation.y);

    this.adventurerModel.position.add(direction);
    this.adventurerModel.rotation.copy(this.currentRotation); // Update character rotation

    this.camera.setup(this.adventurerModel.position, this.adventurerModel.rotation);
  }
}

export class PlayerController {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      Shift: false,
    };

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
  }

  onKeyDown(event) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys["forward"] = true;
        break;
      case "S":
      case "s":
        this.keys["backward"] = true;
        break;
      case "A":
      case "a":
        this.keys["left"] = true;
        break;
      case "D":
      case "d":
        this.keys["right"] = true;
        break;
      case "Shift":
        this.keys["Shift"] = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys["forward"] = false;
        break;
      case "S":
      case "s":
        this.keys["backward"] = false;
        break;
      case "A":
      case "a":
        this.keys["left"] = false;
        break;
      case "D":
      case "d":
        this.keys["right"] = false;
        break;
      case "Shift":
        this.keys["Shift"] = false;
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffset, targetOffset) {
    this.camera = camera;
    this.positionOffset = positionOffset;
    this.targetOffset = targetOffset;
  }

  setup(target, rotation) {
    if (!rotation || !(rotation instanceof THREE.Euler)) {
      console.error("Rotation parameter is missing or not an instance of THREE.Euler");
      return;
    }

    // Update camera position based on character rotation
    const offset = this.positionOffset.clone();
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);

    const cameraPosition = new THREE.Vector3();
    cameraPosition.addVectors(target, offset);
    this.camera.position.copy(cameraPosition);

    const lookAtTarget = new THREE.Vector3();
    lookAtTarget.addVectors(target, this.targetOffset);
    this.camera.lookAt(lookAtTarget);
  }
}
