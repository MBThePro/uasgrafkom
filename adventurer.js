import * as THREE from "three";

export class Player {
  constructor(camera, controller, scene, speed, adventurerModel, renderer) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.speed = speed;
    this.adventurerModel = adventurerModel;
    this.renderer = renderer;
    this.rotationSpeed = Math.PI / 2;
    this.currentRotation = new THREE.Euler(0, 0, 0);
    this.rotationVector = new THREE.Vector3();
    this.cameraBaseOffset = new THREE.Vector3(0, 30, -20.5);
    this.camera.positionOffset = this.cameraBaseOffset.clone();
    this.camera.targetOffset = new THREE.Vector3(0, 30, 0);
    this.mouseLookSpeed = 1.5;
    this.cameraRotationY = 0;

    this.camera.setup(this.adventurerModel.position, this.currentRotation);
  }

  update(dt) {
    var direction = new THREE.Vector3(0, 0, 0);
    let verticalMouseLookSpeed = this.mouseLookSpeed;

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
    if (this.controller.keys["fpp"]) {
      this.cameraBaseOffset.z = -0.5;
      this.camera.positionOffset.copy(this.cameraBaseOffset);
    }
    if (this.controller.keys["tpp"]) {
      this.cameraBaseOffset.z = -20.5;
      this.camera.positionOffset.copy(this.cameraBaseOffset);
    }
    if (this.controller.keys["rotateLeft"]) {
      this.cameraRotationY += this.rotationSpeed * dt;
    }
    if (this.controller.keys["rotateRight"]) {
      this.cameraRotationY -= this.rotationSpeed * dt;
    }

    if (this.controller.keys["lookUp"]) {
      this.cameraBaseOffset.z += 0.5;
    }

    if (this.controller.keys["lookDown"]) {
      this.cameraBaseOffset.z -= 0.5;
    }

    if (this.controller.mouseDown) {
      var dtMouse = this.controller.deltaMousePos;
      dtMouse.x = dtMouse.x / Math.PI;
      dtMouse.y = dtMouse.y / Math.PI;

      this.rotationVector.y += dtMouse.x * 100000 * dt;
      this.camera.targetOffset.y -= dtMouse.y * verticalMouseLookSpeed;
      this.camera.targetOffset.y = THREE.MathUtils.clamp(
        this.camera.targetOffset.y,
        0,
        60
      );
    }

    this.currentRotation.y += this.rotationVector.y * dt;
    this.currentRotation.z += this.rotationVector.z * dt;

    // Reset
    this.rotationVector.set(0, 0, 0);
    direction.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      this.currentRotation.x
    );
    direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.currentRotation.y
    );
    direction.applyAxisAngle(
      new THREE.Vector3(0, 0, 1),
      this.currentRotation.z
    );

    this.adventurerModel.position.add(direction);
    this.adventurerModel.rotation.copy(this.currentRotation);
    this.camera.setup(
      this.adventurerModel.position,
      this.currentRotation,
      this.cameraRotationY
    );
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
      fpp: false,
      tpp: false,
      lookUp: false,
      lookDown: false,
      rotateLeft: false,
      rotateRight: false,
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
  }

  onMouseDown(event) {
    this.mouseDown = true;
  }

  onMouseUp(event) {
    this.mouseDown = false;
  }

  onMouseMove(event) {
    var currentMousePos = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    this.deltaMousePos.subVectors(currentMousePos, this.mousePos);
    this.mousePos.copy(currentMousePos);
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
      case "F":
      case "f":
        this.keys["fpp"] = true;
        break;
      case "T":
      case "t":
        this.keys["tpp"] = true;
        break;
      case "Shift":
        this.keys["Shift"] = true;
        break;
      case "ArrowUp":
        this.keys["lookUp"] = true;
        break;
      case "ArrowDown":
        this.keys["lookDown"] = true;
        break;
      case "ArrowLeft":
        this.keys["rotateLeft"] = true;
        break;
      case "ArrowRight":
        this.keys["rotateRight"] = true;
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
      case "f":
      case "f":
        this.keys["fpp"] = false;
        break;
      case "t":
      case "t":
        this.keys["tpp"] = false;
        break;
      case "Shift":
        this.keys["Shift"] = false;
        break;
      case "ArrowUp":
        this.keys["lookUp"] = false;
        break;
      case "ArrowDown":
        this.keys["lookDown"] = false;
        break;
      case "ArrowLeft":
        this.keys["rotateLeft"] = false;
        break;
      case "ArrowRight":
        this.keys["rotateRight"] = false;
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

  setup(target, rotation, cameraRotationY = 0) {
    var temp = new THREE.Vector3();
    temp.copy(this.positionOffset);
    temp.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation.y + cameraRotationY
    );

    temp.add(target);

    this.camera.position.copy(temp);

    // Use the same target point as before
    var lookAtTarget = new THREE.Vector3();
    lookAtTarget.addVectors(target, this.targetOffset);
    this.camera.lookAt(lookAtTarget);
  }
}
