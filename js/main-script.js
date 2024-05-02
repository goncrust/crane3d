import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var curr_camera,
    lateral_camera,
    top_camera,
    frontal_camera,
    claw_camera,
    broad_p_camera,
    broad_o_camera;

var scene, renderer, geometry, mesh;
var materials = {
    grey: new THREE.MeshBasicMaterial({ color: 0x727272, wireframe: true }),
    darkOrange: new THREE.MeshBasicMaterial({
        color: 0xfc6d00,
        wireframe: true,
    }),
    lightOrange: new THREE.MeshBasicMaterial({
        color: 0xfcc100,
        wireframe: true,
    }),
    lightBlue: new THREE.MeshBasicMaterial({
        color: 0x85e6fc,
        wireframe: true,
    }),
};
var dimensions = {
    hBase: 5,
    lBase: 10,
    hTower: 20,
    lTower: 5,
    lCab: 0,
    hCounterWeight: 0,
    cCounterWeight: 0,
    hCounterJib: 0,
    cCounterJib: 0,
    hJib: 0,
    cJib: 0,
    hDifference: 0,
    hInferiorTowerPeak: 0,
    hSuperiorTowerPeak: 0,
    hTrolley: 0,
    cTrolley: 0,
    lClawBase: 0,
    hClawBase: 0,
    lClaw: 0,
    hClaw: 0,
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
    lateral_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    lateral_camera.position.x = 0;
    lateral_camera.position.y = 50;
    lateral_camera.position.z = 50;
    lateral_camera.lookAt(0, 50, 0);
}

function createFrontalCamera() {
    "use strict";
    frontal_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    frontal_camera.position.x = 100;
    frontal_camera.position.y = 50;
    frontal_camera.position.z = 0;
    frontal_camera.lookAt(0, 50, 0);
}

function createTopCamera() {
    "use strict";
    top_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    top_camera.position.x = 0;
    top_camera.position.y = 100;
    top_camera.position.z = 0;
    top_camera.lookAt(0, 0, 0);
}

function createClawCamera() {
    "use strict";
    claw_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    // TODO
    claw_camera.position.x = 50;
    claw_camera.position.y = 50;
    claw_camera.position.z = 50;
    claw_camera.lookAt(scene.position);
}

function createBroadPerpectiveCamera() {
    "use strict";
    broad_p_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    broad_p_camera.position.x = 75;
    broad_p_camera.position.y = 75;
    broad_p_camera.position.z = 75;
    broad_p_camera.lookAt(0, 50, 0);
}

function createBroadOrthographicCamera() {
    "use strict";
    broad_o_camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    broad_o_camera.position.x = 75;
    broad_o_camera.position.y = 75;
    broad_o_camera.position.z = 75;
    broad_o_camera.lookAt(0, 50, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    createLowerCrane(0, 0, 0);

    //createUpperCrane(crane, 0, 10, 0);
}

function createLowerCrane(x, y, z) {
    "use strict";

    var lowerCrane = new THREE.Object3D();

    addBase(lowerCrane, 0, 0, 0);
    addTower(lowerCrane, 5, 15, 5);

    scene.add(lowerCrane);

    lowerCrane.position.x = x;
    lowerCrane.position.y = y;
    lowerCrane.position.z = z;
}

function addBase(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lBase,
        dimensions.hBase,
        dimensions.lBase,
    );
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTower(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lTower,
        dimensions.hTower,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.lightOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addUpperCrane(obj, x, y, z) {
    "use strict";
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
    renderer.render(scene, curr_camera);
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

    curr_camera = broad_p_camera;

    bindEvents();
    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    "use strict";
}

////////////////////////////
/*        EVENTS          */
////////////////////////////
function bindEvents() {
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    "use strict";
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        curr_camera.aspect = window.innerWidth / window.innerHeight;
        curr_camera.updateProjectionMatrix();
    }
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
