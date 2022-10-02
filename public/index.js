import * as THREE from "/node_modules/three/build/three.module.js";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {OrbitControls} from "/node_modules/three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import {Raycaster} from "/node_modules/three/src/core/Raycaster.js"

//global declaration
let scene;
let camera;
let renderer;
let controls;
let psp;
const canvas = document.getElementsByTagName("canvas")[0];
scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

//camera
var zoomFactor=1;
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 10;
scene.add(camera);
function zoomIn(){camera.zoom<3?camera.zoom+=0.5:true};
function zoomOut(){camera.zoom>0.5?camera.zoom-=0.1:true};
document.getElementById('zin').addEventListener("click", zoomIn);
document.getElementById('zout').addEventListener("click", zoomOut);

//raycaster
const raycaster = new Raycaster();


//default renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setClearColor(0x000000, 0.0);

//bloom renderer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4, 
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2; //intensity of glow
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//sun object
const color = new THREE.Color("#FDB813");
const geometry = new THREE.IcosahedronGeometry(1, 20);
const material = new THREE.MeshBasicMaterial({ color: color });
const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(0, 0, 0);
scene.add(sphere);


//random sphere
const geometry1 = new THREE.SphereGeometry( 15, 32, 16 );
const material1 = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const sphere1= new THREE.Mesh( geometry1, material1 );
//scene.add( sphere1 );

//psp object
const loader = new GLTFLoader();
// Load a glTF resource
loader.load(
	// resource URL
	'/models/PSP.glb',
	// called when the resource is loaded
	function ( gltf ) {
    psp=gltf.scene;
    gltf.scene.scale.set(0.3,0.3,0.3);
    gltf.scene.position.set(0,3,0);
		scene.add( gltf.scene);
	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture("texture/galaxy1.png"),
  side: THREE.BackSide,
  transparent: true,
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

//ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientlight);

//directionnal light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(10,10,10);
scene.add( directionalLight );

//resize listner
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

//orbit control
controls = new OrbitControls( camera, renderer.domElement );

//animation loop
const animate = (t) => {
  requestAnimationFrame(animate);
  //psp.position.x+=5*Math.cos(t/600);
  //psp.position.z+=5*Math.sin(t/600);
  //psp.position.y=0;
  psp.position.set(3*Math.sin(t/600),3*Math.cos(t/600),0);
  controls.update();
  bloomComposer.render();
};

animate();
