import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer, geometry, mesh;
var materials = {
    grey: new THREE.MeshBasicMaterial({ color: 0x727272, wireframe: true }),
    darkOrange: new THREE.MeshBasicMaterial({ color: 0xfc6d00, wireframe: true }),
    lightOrange: new THREE.MeshBasicMaterial({ color: 0xfcc100, wireframe: true }),
    lightBlue: new THREE.MeshBasicMaterial({ color: 0x85e6fc, wireframe: true }),
};
var dimensions = {
    hBase,
    lBase,
    hTower,
    lTower,
    lCab,
    hCounterWeight,
    cCounterWeight,
    hCounterJib,
    cCounterJib,
    hJib,
    cJib,
    hDifference,
    hInferiorTowerPeak,
    hSuperiorTowerPeak,
    hTrolley,
    cTrolley,
    lClawBase,
    hClawBase,
    lClaw,
    hClaw,
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    "use strict";

    scene = new THREE.Scene();

    // Referencial Global - WCS
    scene.add(new THREE.AxesHelper(10));

    createCrane();

    createBase(0, 0, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    createLateralCamera();
    createFrontalCamera();
    createTopCamera();
    createClawCamera();
    createBroadPerpectiveCamera();
    createBroadOrthographicCamera();
}

function createLateralCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.x = 0;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(0, 50, 0);
}

function createFrontalCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.x = 100;
    camera.position.y = 50;
    camera.position.z = 0;
    camera.lookAt(0, 50, 0);
}

function createTopCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);
}

function createClawCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    // TODO
    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(scene.position);
}

function createBroadPerpectiveCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.x = 75;
    camera.position.y = 75;
    camera.position.z = 75;
    camera.lookat(0, 50, 0);
}

function createBroadOrthographicCamera() {
    "use strict";
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.x = 75;
    camera.position.y = 75;
    camera.position.z = 75;
    camera.lookat(0, 50, 0);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

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
function checkCollisions() {
    "use strict";
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    "use strict";
}

////////////
/* UPDATE */
////////////
function update() {
    "use strict";
}

/////////////
/* DISPLAY */
/////////////
function render() {
    "use strict";
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    "use strict";
    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    "use strict";
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    "use strict";
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    "use strict";
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    "use strict";
}

init();
animate();
