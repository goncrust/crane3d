import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var ref_wcs, ref_rotation, ref_car, ref_claw;

var curr_camera,
    lateral_camera,
    top_camera,
    frontal_camera,
    claw_camera,
    broad_p_camera,
    broad_o_camera;

var scene, renderer, geometry, mesh;
var materials = {
    grey: new THREE.MeshBasicMaterial({ color: 0x727272, wireframe: false }),
    darkOrange: new THREE.MeshBasicMaterial({
        color: 0xfc6d00,
        wireframe: false,
    }),
    lightOrange: new THREE.MeshBasicMaterial({
        color: 0xfcc100,
        wireframe: false,
    }),
    lightBlue: new THREE.MeshBasicMaterial({
        color: 0x85e6fc,
        wireframe: false,
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
    cJib: 30,
    hDifference: 0,
    hInferiorTowerPeak: 20,
    hSuperiorTowerPeak: 10,
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
    //scene.add(new THREE.AxesHelper(10));

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
    lateral_camera.position.set(0, 50, 130);
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
    frontal_camera.position.set(100, 50, 0);
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
    top_camera.position.set(0, 100, 0);
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
    claw_camera.position.set(50, 50, 50);
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
    broad_p_camera.position.set(75, 75, 75);
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
    broad_o_camera.position.set(75, 75, 75);
    broad_o_camera.lookAt(0, 50, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    createLowerCrane(0, 0, 0);
    createUpperCrane(0, dimensions.hBase + dimensions.hTower, 0);
    //createCar
    //createClaw
}

function createLowerCrane(x, y, z) {
    "use strict";

    var lowerCrane = new THREE.Object3D();

    lowerCrane.add(new THREE.AxesHelper(5));

    addBase(lowerCrane, 0, dimensions.hBase / 2, 0);
    addTower(lowerCrane, 0, dimensions.hTower / 2 + dimensions.hBase, 0);

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

function createUpperCrane(x, y, z) {
    "use strict";

    var upperCrane = new THREE.Object3D();

    // Referencial Filho: Eixo Rotatório
    upperCrane.add(new THREE.AxesHelper(5));

    addSuperiorTowerPeak(
        upperCrane,
        dimensions.lTower,
        dimensions.hSuperiorTowerPeak,
        dimensions.lTower,
    );
    addInferiorTowerPeak(upperCrane, 0, dimensions.hInferiorTowerPeak / 2, 0);
    addJib(upperCrane, x + (dimensions.cJib + dimensions.lTower) / 2, y, z);
    //addTurntable(upperCrane, x, y, z);
    //addCab(upperCrane, x, y, z);
    //addCounterjib(upperCrane, x, y, z);
    //addCounterWeight(upperCrane, x, y, z);

    scene.add(upperCrane);

    upperCrane.position.x = x;
    upperCrane.position.y = y;
    upperCrane.position.z = z;
}

function addSuperiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.ConeGeometry(
        (dimensions.lTower * 3) / 4,
        dimensions.hSuperiorTowerPeak,
        4,
    ).rotateY(4);
    mesh = new THREE.Mesh(geometry, materials.lightOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addJib(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cJib,
        dimensions.lTower,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}
function addInferiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lTower,
        dimensions.hInferiorTowerPeak,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
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
    bindEvents();
    createCameras();
    curr_camera = broad_p_camera;
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    "use strict";
    update();
    render();
    requestAnimationFrame(animate);
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

    switch (e.keyCode) {
        case 49: //1
            curr_camera = frontal_camera;
            for (var material in materials) {
                materials[material].wireframe = !materials[material].wireframe;
            }
            break;
        case 50: //2
            curr_camera = lateral_camera;
            break;
        case 51: //3
            curr_camera = top_camera;
            break;
        case 52: //4
            curr_camera = broad_o_camera;
            break;
        case 53: //5
            curr_camera = broad_p_camera;
            break;
        case 54: //6
            curr_camera = claw_camera;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    "use strict";
}

init();
animate();
