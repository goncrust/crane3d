import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var lateral_camera,
    top_camera,
    frontal_camera,
    claw_camera,
    broad_p_camera,
    broad_o_camera;

var scene, renderer, geometry, mesh;
var materials = {
    grey: new THREE.MeshBasicMaterial({ color: 0x727272, wireframe: true }),
    darkOrange: new THREE.MeshBasicMaterial({ color: 0xfc6d00, wireframe: true }),
    lightOrange: new THREE.MeshBasicMaterial({ color: 0xfcc100, wireframe: true }),
    lightBlue: new THREE.MeshBasicMaterial({ color: 0x85e6fc, wireframe: true }),
};
var dimensions = {
    hBase: 10,
    lBase: 5,
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
    broad_p_camera.lookat(0, 50, 0);
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
    broad_o_camera.lookat(0, 50, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    createLowerCrane(0, 0, 0);
    createUpperCrane(0, 10, 0);
}

function createLowerCrane(x, y, z) {
    "use strict";
}

function createUpperCrane(x, y, z) {
    "use strict";
}

function createBase(x, y, z) {
    "use strict";

    var base = new THREE.Object3D();

    material = materials.grey;
    geometry = new THREE.BoxGeometry(dimensions.lBase, dimensions.hBase, dimensions.lBase);
    mesh = new THREE.Mesh(geometry, material);
    base.add(mesh);

    base.position.set(x, y, z);

    scene.add(base);
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
    renderer.render(scene, lateral_camera);
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
