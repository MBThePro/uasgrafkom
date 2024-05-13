import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js"
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// setup scene and camera

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Move the camera back along the z-axis
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.update();


const points = [];
for ( let i = 0; i < 10; i ++ ) {
	points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
}
const geometry = new THREE.LatheGeometry( points,30 );
geometry.scale(0.1,0.1,0.1);
geometry.rotateZ(3.14);

const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
const body = new THREE.Mesh( geometry, material );
body.position.set(0,-1.8,0);
scene.add(body);


// head
var headGeo = new THREE.SphereGeometry(1,10,10);
headGeo.scale(1.4,1.4,1.4)
var headMaterial = new THREE.MeshPhongMaterial({color: 0x3333ff});
var head = new THREE.Mesh(headGeo, headMaterial);
scene.add(head);


//hoodie
const pointsHoodie = [];
for ( let i = 0; i < 10; i ++ ) {
	points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
}
const geometryHoodie = new THREE.LatheGeometry( points,3, 0 ,3.14 );
geometryHoodie.scale(0.02,0.0,0.07);
const materialHoodie = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
const hoodie = new THREE.Mesh( geometryHoodie, materialHoodie );
hoodie.position.set(1,-0.9,0);
hoodie.rotateX(3.14);
hoodie.rotateZ(0.9)
scene.add(hoodie);



// earth
var earthGeo = new THREE.SphereGeometry(1,10,10);
var earthMaterial = new THREE.MeshPhongMaterial({color: 0x3333ff});
var earth = new THREE.Mesh(earthGeo, earthMaterial);
body.add(earth);
earth.position.set(5,0,0);
earth.scale.set(0.5, 0.5, 0.5);

var moongeo = new THREE.SphereGeometry(1,10,10);
var moonMaterial = new THREE.MeshPhongMaterial({color:0x55555});
var moon = new THREE.Mesh(moongeo, moonMaterial);
moon.position.set(5,0,0);
moon.scale.set(0.25,0.25,0.25);

new MTLLoader()
					.setPath( 'resources/Satellite/' )
					.load( 'Satelite.mtl', function ( materials ) {

						materials.preload();

						new OBJLoader()
							.setMaterials( materials )
							.setPath( 'resources/Satellite/' )
							.load( 'Satelite.obj', function ( object ) {

								// object.position.y = - 0.95;
								// object.scale.setScalar( 0.01 );
								earth.add( object );
                                object.scale.set(0.1,0.1,0.1);
                                object.position.set(-3,0,0);

							} );

					} );

// ambient light
// var ambientLight = new THREE.AmbientLight(0xFF9999);
// scene.add(ambientLight);
 
var hemiSphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.8);
scene.add(hemiSphereLight);

var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 10);
directionalLight.position.set(3,3,3);
directionalLight.target.position.set(0,0,0);
scene.add(directionalLight);
scene.add(directionalLight.target);

var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);

var pointLight = new THREE.PointLight(0xFFFF11, 150);
body.add(pointLight);

var spotLight = new THREE.SpotLight(0xFF1111, 200);
moon.add(spotLight);
earth.add(spotLight.target);

scene.add(new THREE.SpotLightHelper(spotLight));
// loop animate
function animate(){
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
    

    earth.rotation.y += 0.01;
}
requestAnimationFrame(animate);