import * as THREE from "three";
var headBobActive_ = false;
var headBobSpeed = 0.5;
export class Player {
  constructor(
    camera,
    controller,
    scene,
    speed,
    adventurerModel,
    adventurerActions,
    renderer,
    enviromentBoundingBox
  ) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.speed = speed;
    this.adventurerModel = adventurerModel;
    this.adventurerActions = adventurerActions;
    this.renderer = renderer;
    this.enviromentBoundingBox = enviromentBoundingBox;
    this.rotationSpeed = Math.PI / 2;
    this.currentRotation = new THREE.Euler(0, 0, 0);
    this.rotationVector = new THREE.Vector3();
    this.cameraBaseOffset = new THREE.Vector3(0, 17, -15.5); // For TPP
    this.cameraHeadOffset = new THREE.Vector3(0, 16, 0); // For FPP
    this.zoomLevel = 0;
    this.zoomIncrement = 5;
    this.camera.positionOffset = this.cameraBaseOffset.clone();
    this.camera.targetOffset = new THREE.Vector3(0, 10, 0);
    this.mouseLookSpeed = 1.5;
    this.cameraRotationY = 0;
    this.cameraRotationZ = 0;
    this.xLevel = 0;
    this.isFpp = false;
    this.isZoomed = false;
    this.isZooming = false;
    this.camera.setup(this.adventurerModel.position, this.currentRotation);

    this.activeAction = this.adventurerActions["idle"];
    this.activeAction.play();
  }

  checkCollision() {
    const playerBoundingBox = new THREE.Box3().setFromObject(
      this.adventurerModel
    );
    for (const boundingBox of this.enviromentBoundingBox) {
      if (playerBoundingBox.intersectsBox(boundingBox)) {
        console.log(boundingBox);
        return true;
      }
    }
    return false;
  }

  switchAnimation(newAction) {
    if (newAction !== this.activeAction) {
      const previousAction = this.activeAction;
      this.activeAction = newAction;
      previousAction.fadeOut(0.5);
      this.activeAction.reset().fadeIn(0.5).play();
    }
  }

  update(dt) {
    var direction = new THREE.Vector3(0, 0, 0);
    let verticalMouseLookSpeed = this.mouseLookSpeed;
    // Define the limits for xLevel
    const xLevelMin = -Math.PI / 2; // Limit for looking straight up
    const xLevelMax = Math.PI / 2; // Limit for looking straight down

    // Animation
    if (this.checkCollision()) this.controller.keys["forward"] = false;
    if (this.controller.keys["Shift"]) {
      this.switchAnimation(this.adventurerActions["run"]);
    } else if (
      this.controller.keys["Shift"] &&
      (this.controller.keys["forward"] ||
        this.controller.keys["left"] ||
        this.controller.keys["backward"] ||
        this.controller.keys["right"])
    ) {
      this.switchAnimation(this.adventurerActions["run"]);
    } else if (
      this.controller.keys["forward"] ||
      this.controller.keys["left"] ||
      this.controller.keys["backward"] ||
      this.controller.keys["right"]
    ) {
      this.switchAnimation(this.adventurerActions["walk"]);
    } else {
      this.switchAnimation(this.adventurerActions["idle"]);
    }

    if (this.controller.keys["forward"]) {
      direction.z += this.speed * dt;
      headBobActive_ = true;
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
      headBobSpeed = 0.65;
    } else {
      headBobSpeed = 0.5;
    }
    if (this.controller.keys["fpp"]) {
      this.isFpp = true;
      this.camera.positionOffset.copy(this.cameraHeadOffset); // Set to head position for FPP
    }
    if (this.controller.keys["tpp"]) {
      this.isFpp = false;
      this.camera.positionOffset.copy(this.cameraBaseOffset); // Set to default for TPP
      this.cameraRotationZ = 0;
    }
    if (this.controller.keys["rotateLeft"]) {
      this.cameraRotationY += this.rotationSpeed * dt;
    }
    if (this.controller.keys["rotateRight"]) {
      this.cameraRotationY -= this.rotationSpeed * dt;
    }

    if (this.controller.keys["zoomIn"] || this.controller.keys["zoomOut"]) {
      this.isZooming = true; // Set zooming state
      this.zoomLevel += this.controller.keys["zoomIn"]
        ? -this.zoomIncrement
        : this.zoomIncrement;
      const zoomFactor = this.zoomLevel * 0.1;
      if (!this.isFpp) {
        const zoomedOffset = new THREE.Vector3(
          0,
          17 + zoomFactor * this.xLevel,
          -15.5 - zoomFactor
        );
        this.camera.positionOffset.copy(zoomedOffset);
      }
      else {
        const zoomedOffset = new THREE.Vector3(
          0,
          16 + zoomFactor * this.xLevel,
          0 - zoomFactor
        );
        this.camera.positionOffset.copy(zoomedOffset);

      }
    } else {
      this.zoomLevel = 0;
      this.isZooming = false; // Reset zooming state
      if (this.isFpp) this.camera.positionOffset.copy(this.cameraHeadOffset);
      else this.camera.positionOffset.copy(this.cameraBaseOffset);
    }


    const headTiltSpeed = 0.1;
    if (this.isFpp) {
      if (this.controller.keys["tiltLeft"]) {
        this.cameraRotationZ = Math.min(
          this.cameraRotationZ + this.rotationSpeed * dt,
          15 * (Math.PI / 180)
        );
      } else if (this.controller.keys["tiltRight"]) {
        this.cameraRotationZ = Math.max(
          this.cameraRotationZ - this.rotationSpeed * dt,
          -15 * (Math.PI / 180)
        );
      } else {
        // If no tilt keys are pressed, reset cameraRotationZ to zero
        if (this.cameraRotationZ > 0) {
          this.cameraRotationZ = Math.max(this.cameraRotationZ - this.rotationSpeed * dt, 0);
        } else if (this.cameraRotationZ < 0) {
          this.cameraRotationZ = Math.min(this.cameraRotationZ + this.rotationSpeed * dt, 0);
        }
      }
    }

    this.currentRotation.z = THREE.MathUtils.lerp(
      this.currentRotation.z,
      this.cameraRotationZ,
      headTiltSpeed
    );

    if (this.controller.mouseDown) {
      var dtMouse = this.controller.deltaMousePos;
      dtMouse.x = dtMouse.x / Math.PI;
      dtMouse.y = dtMouse.y / Math.PI;

      this.rotationVector.y += dtMouse.x * 100000 * dt;

      // Adjust the xLevel with clamping
      this.xLevel += dtMouse.y / 10;
      this.xLevel = THREE.MathUtils.clamp(this.xLevel, xLevelMin, xLevelMax);

      this.camera.targetOffset.y -= dtMouse.y * verticalMouseLookSpeed;
      this.camera.targetOffset.y = THREE.MathUtils.clamp(
        this.camera.targetOffset.y,
        0,
        60
      );
    }

    console.log(this.xLevel);
    this.currentRotation.y += this.rotationVector.y * dt;
    this.currentRotation.z += this.rotationVector.z * dt;

    // Reset
    this.rotationVector.set(0, 0, 0);

    // Apply player rotation to direction vector
    direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.currentRotation.y
    );

    if (this.isFpp) {
      // Apply camera rotation in FPP
      direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.cameraRotationY
      );
    }

    this.adventurerModel.position.add(direction);
    this.adventurerModel.rotation.copy(this.currentRotation);
    this.camera.setup(
      this.adventurerModel.position,
      this.currentRotation,
      this.cameraRotationY,
      this.isFpp,
      this.cameraRotationZ,
      this.xLevel,
      this.isZooming
    );
  }
}

export class PlayerController {
  constructor(camera) {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      Shift: false,
      fpp: false,
      tpp: false,
      tiltLeft: false,
      tiltRight: false,
      rotateLeft: false,
      rotateRight: false,
      zoomIn: false,
      zoomOut: false,
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    this.camera = camera;

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

    this.deltaMousePos.y *= -100;
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
        this.keys["fpp"] = !this.keys["fpp"];
        this.keys["tpp"] = false;
        break;
      case "T":
      case "t":
        this.keys["tpp"] = !this.keys["tpp"];
        this.keys["fpp"] = false;
        break;

      case "Shift":
        this.keys["Shift"] = true;
        break;
      case "ArrowUp":
        this.keys["tiltLeft"] = true;
        break;
      case "ArrowDown":
        this.keys["tiltRight"] = true;
        break;
      case "ArrowLeft":
        this.keys["rotateLeft"] = true;
        break;
      case "ArrowRight":
        this.keys["rotateRight"] = true;
        break;
      case "=":
        this.keys["zoomIn"] = true;
        break;
      case "-":
        this.keys["zoomOut"] = true;
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
      case "ArrowUp":
        this.keys["tiltLeft"] = false;
        break;
      case "ArrowDown":
        this.keys["tiltRight"] = false;
        break;
      case "ArrowLeft":
        this.keys["rotateLeft"] = false;
        break;
      case "ArrowRight":
        this.keys["rotateRight"] = false;
        break;
      case "=":
        this.keys["zoomIn"] = false;
        break;
      case "-":
        this.keys["zoomOut"] = false;
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffset, targetOffset) {
    this.camera = camera;
    this.positionOffset = positionOffset;
    this.targetOffset = targetOffset;
    this.cameraRotationZ = 0;
    this.headBobTimer_ = 0;
    this.isFpp = false;
  }

  setup(
    target,
    rotation,
    cameraRotationY = 0,
    isFpp = false,
    cameraRotationZ = 0,
    xLevel,
    isZooming = false
  ) {
    var temp = new THREE.Vector3();
    temp.copy(this.positionOffset);
    temp.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation.y + cameraRotationY
    );
    // temp.applyAxisAngle(
    //   new THREE.Vector3(0, 0, 1),
    //   rotation.z + cameraRotationZ
    // );
    temp.add(target);


    this.camera.position.copy(temp);
    if (!isZooming) {
      if (!isFpp) {
        var lookAtTarget = new THREE.Vector3();
        lookAtTarget.addVectors(target, this.targetOffset);
        this.camera.lookAt(lookAtTarget);
        this.isFpp = false;
      } else {
        this.isFpp = true;
        // Apply pitch (xLevel) and yaw (rotation.y) separately
        this.camera.rotation.order = "YXZ"; // Ensure correct order of rotations
        this.camera.rotation.y = rotation.y + Math.PI - cameraRotationY; // Yaw
        this.camera.rotation.x = -xLevel; // Pitch
        this.camera.rotation.z = cameraRotationZ; // Roll (if needed)
      }
    }
  }

  updateHeadBob_(timeElapsedS) {
    if (!this.isFpp) return;

    var x, y, z;
    z = this.camera.position.z;
    y = this.camera.position.y;
    x = this.camera.position.x;

    this.camera.position.set(
      x,
      y + Math.sin(this.headBobTimer_ * 10) * headBobSpeed,
      z
    );

    if (headBobActive_) {
      const wavelength = Math.PI;
      const nextStep =
        1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
      const nextStepTime = (nextStep * wavelength) / 10;
      this.headBobTimer_ = Math.min(
        this.headBobTimer_ + timeElapsedS,
        nextStepTime
      );

      if (this.headBobTimer_ == nextStepTime) {
        headBobActive_ = false;
      }
    }
  }
}
