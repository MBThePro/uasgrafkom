import './style.css'
import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { rotate } from 'three/examples/jsm/nodes/Nodes.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { TextureLoader } from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth
  /window.innerHeight,0.1,1000);
camera.position.set(0,0,100);
camera.lookAt(0,0,0);

//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,5,0)
controls.update()

//LIGHT
//Directional light
var color = 0xFFFFF;
var light = new THREE.DirectionalLight(color, 0.5)
light.position.set(0,10,0);
light.target.position.set(-5,0,0)
scene.add(light)
scene.add(light.target)

// Hemisphere light
light = new THREE.HemisphereLight(0xB1E1FF,0xB97A20,0.5)
scene.add(light)

// Point light
light = new THREE.PointLight(0xFFFF00, 100)
light.position.set(0,10,0)
scene.add(light)

//Spot light
light = new THREE.SpotLight(0xFF0000, 50)
light.position.set(10,10,10)
scene.add(light)

//Geometry
const objects = [];

const onProgress = function ( xhr ) {

  if ( xhr.lengthComputable ) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log( percentComplete.toFixed( 2 ) + '% downloaded' );

  }

};

const textureLoader = new THREE.TextureLoader()
const textureCube = textureLoader.load('resources/snow.png')

// Lantai
{
  var lantai = new THREE.BoxGeometry(100,4,100);
  var lantaiMat = new THREE.MeshStandardMaterial({
    map:textureCube
})
  var mesh = new THREE.Mesh(lantai, lantaiMat)
  mesh.position.set(0,-2,0)
  scene.add(mesh)
}

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'stan marsh.mtl', function ( materials ) {

	materials.preload();

	new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'stan marsh.obj', function ( object ) {
      object.scale.setScalar(10)
      object.rotation.y = 1.5
      object.position.x = -20
			scene.add( object );

		}, onProgress );

} );

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'kyle.mtl', function ( materials ) {

	materials.preload();

	new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'kyle.obj', function ( object ) {
      object.scale.setScalar(10)
      object.rotation.y = -1.5
      object.useEnvironment
      object.position.x = 20
			scene.add( object );

		}, onProgress );

} );

var time_prev = 0;
function animate(time){
  var dt = time - time_prev;
  dt *= 0.1;

  objects.forEach((obj)=>{
    obj.rotation.z += dt * 0.01;
  });

  renderer.render(scene,camera);

  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

