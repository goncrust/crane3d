import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;
var materials = {
    grey: new THREE.MeshBasicMaterial({ color: 0x727272, wireframe: false }),
    darkorange: new THREE.MeshBasicMaterial({ color: 0xfc6d00, wireframe: true }),
    lightorange: new THREE.MeshBasicMaterial({ color: 0xfcc100, wireframe: false }),
};
var geometry, material, mesh;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    // Referencial Global - WCS
    scene.add(new THREE.AxesHelper(10));

    createCrane();

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera(){
    'use strict';
    camera = new THREE.PerspectiveCamera(70,
            window.innerWidth / window.innerHeight,
            1,
            1000);
    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////



////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    'use strict';

    createLowerCrane(0, 0, 0);

    //createUpperCrane(crane, 0, 10, 0);
}

function createLowerCrane(x, y, z) {
    'use strict';

    var lowerCrane = new THREE.Object3D();

    addBase(lowerCrane, 0, 0, 0);
    addTower(lowerCrane, 5, 15, 5);
    
    scene.add(lowerCrane);

    lowerCrane.position.x = x;
    lowerCrane.position.y = y;
    lowerCrane.position.z = z;
}

function addBase(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(10, 5, 10);
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTower(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(5, 20, 5);
    mesh = new THREE.Mesh(geometry, materials.lightorange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addUpperCrane(obj, x, y, z) {
    'use strict';
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);

}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera();

    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();
