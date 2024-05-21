import * as THREE from "three";

export class Player {
  constructor(camera, controller, scene, speed, adventurerModel) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.speed = speed;
    this.adventurerModel = adventurerModel;
    this.camera.setup(new THREE.Vector3(3, 0, 0));
  }

  update(dt) {
    var direction = new THREE.Vector3(0, 0, 0);
    var moveDirection = new THREE.Vector3(0, 0, 0); // For rotation

    if (this.controller.keys["forward"]) {
      direction.z += this.speed * dt;
      moveDirection.z += 1;
    }
    if (this.controller.keys["backward"]) {
      direction.z -= this.speed * dt;
      moveDirection.z -= 1;
    }
    if (this.controller.keys["left"]) {
      direction.x += this.speed * dt;
      moveDirection.x += 1;
    }
    if (this.controller.keys["right"]) {
      direction.x -= this.speed * dt;
      moveDirection.x -= 1;
    }
    if (this.controller.keys["Shift"]) {
      direction.multiplyScalar(2);
    }

    if (!moveDirection.equals(new THREE.Vector3(0, 0, 0))) {
      moveDirection.normalize();
      var targetPosition = new THREE.Vector3();
      targetPosition.addVectors(this.adventurerModel.position, moveDirection);
      this.adventurerModel.lookAt(targetPosition);
    }

    this.adventurerModel.position.add(direction);

    this.camera.setup(this.adventurerModel.position);

    window.addEventListener("keydown", (event) => {
      if (event.key == "f") {
        this.camera.positionOffset.z = -0.5;
      } else if (event.key == "t") {
        this.camera.positionOffset.z = -20.5;
      }
    });
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

  setup(target) {
    var temp = new THREE.Vector3();
    temp.addVectors(target, this.positionOffset);
    this.camera.position.copy(temp);
    temp = new THREE.Vector3();
    temp.addVectors(target, this.targetOffset);
    this.camera.lookAt(temp);
  }
}
