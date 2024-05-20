import * as THREE from "three";

export class Player{
    constructor(camera, controller, scene, speed,adventurerModel){
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;

        this.camera.setup(new THREE.Vector3(3,0,0));
    }

    update(dt){
        var direction = new THREE.Vector3(0,0,0);
        if(this.controller.keys['forward']){
            direction.x = this.speed*dt;
        }
        if(this.controller.keys['backward']){
            direction.x = -this.speed*dt;
        }
        if(this.controller.keys['left']){
            direction.z = -this.speed*dt;
        }
        if(this.controller.keys['right']){
            direction.z = this.speed*dt;
        }
        this.adventurerModel.position.add(direction);
        this.camera.setup(adventurerModel.position);
    }

}

export class PlayerController{
    constructor(){
        this.keys = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false,
            "Shift" :false
        };
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }
    onKeyDown(event){
        switch(event.key){
            case 'W':
            case 'w': this.keys['forward'] = true; break;
            case 'S':
            case 's': this.keys['backward'] = true; break;
            case 'A':
            case 'a': this.keys['left'] = true; break;
            case 'D':
            case 'd': this.keys['right'] = true; break;
        }
    }
    onKeyUp(event){
        switch(event.key){
            case 'W':
            case 'w': this.keys['forward'] = false; break;
            case 'S':
            case 's': this.keys['backward'] = false; break;
            case 'A':
            case 'a': this.keys['left'] = false; break;
            case 'D':
            case 'd': this.keys['right'] = false; break;
        }
    }
}

export class ThirdPersonCamera{
    constructor(camera, positionOffSet, targetOffSet){
        this.camera = camera;
        this.positionOffSet = positionOffSet;
        this.targetOffSet = targetOffSet;
    }
    setup(target){
        var temp = new THREE.Vector3();
        temp.addVectors(target, this.positionOffSet);
        this.camera.position.copy(temp);
        temp = new THREE.Vector3();
        temp.addVectors(target, this.targetOffSet);
        this.camera.lookAt(temp);
    }
}