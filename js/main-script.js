import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let currCamera,
    lateralCamera,
    topCamera,
    frontalCamera,
    clawCamera,
    broadPCamera,
    broadOCamera;

let scene, renderer, geometry, mesh;

let crane, lowerCrane, upperCrane, trolley, claw;

let materials = {
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

const BASE_H_ROPE = 5;

let dimensions = {
    hBase: 5,
    lBase: 10,
    hTower: 20,
    lTower: 5,
    lCab: 5,
    hCounterWeight: 5,
    cCounterWeight: 10,
    cCounterJib: 15,
    hJib: 5,
    cJib: 30,
    hDifference: 10,
    hInferiorTowerPeak: 20,
    hSuperiorTowerPeak: 5,
    hTrolley: 3,
    cTrolley: 6,
    lClawBase: 3,
    hClawBase: 2,
    lClaw: 0,
    hClaw: 0,
    rRope: 0.5,
    hRope: BASE_H_ROPE,
};

let pressedKeys = {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    'q': false,
    'a': false,
    'w': false,
    's': false,
    'e': false,
    'd': false,
};

const MAX_TROLLEY_X = dimensions.cJib + dimensions.lTower / 2 - dimensions.cTrolley / 2;
const MIN_TROLLEY_X = dimensions.lTower / 2 + dimensions.cTrolley / 2;

const MIN_ROPE_SCALE = 0;
const MAX_ROPE_SCALE = (dimensions.hTower + dimensions.hDifference - dimensions.hTrolley) / BASE_H_ROPE;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const MIN_TOWER_ANGLE = 0;
const MAX_TOWER_ANGLE = Math.PI;

let ropeScale, trolleyX, towerAngle;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    "use strict";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fe2bf);

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
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    lateralCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    lateralCamera.position.set(0, 30, 70);
    lateralCamera.lookAt(0, 30, 0);
}

function createFrontalCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    frontalCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    frontalCamera.position.set(100, 30, 0);
    frontalCamera.lookAt(0, 30, 0);
}

function createTopCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    topCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    topCamera.position.set(0, 70, 0);
    topCamera.lookAt(0, 0, 0);
}

function createClawCamera() {
    "use strict";
    clawCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    // TODO
    clawCamera.position.set(50, 50, 50);
    clawCamera.lookAt(scene.position);
}

function createBroadPerpectiveCamera() {
    "use strict";
    broadPCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    broadPCamera.position.set(40, 40, 40);
    broadPCamera.lookAt(0, 25, 0);
}

function createBroadOrthographicCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    broadOCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    broadOCamera.position.set(40, 40, 40);
    broadOCamera.lookAt(0, 25, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    let heightUpperTower = dimensions.hBase + dimensions.hTower;
    let heightTrolley = dimensions.hDifference;

    ropeScale = 1;
    trolleyX = dimensions.cJib / 2;
    towerAngle = 0;

    crane = new THREE.Object3D();

    createLowerCrane(0, 0, 0);
    crane.add(lowerCrane);

    createUpperCrane(0, heightUpperTower, 0);
    lowerCrane.add(upperCrane);

    createTrolley(trolleyX, heightTrolley, 0);
    upperCrane.add(trolley);

    // createClaw(0, -(dimensions.hTrolley + dimensions.hRope), 0);
    // trolley.add(claw);

    scene.add(crane);
}

function createLowerCrane(x, y, z) {
    "use strict";

    lowerCrane = new THREE.Object3D();

    lowerCrane.add(new THREE.AxesHelper(10));

    addBase(lowerCrane, 0, dimensions.hBase / 2, 0);
    addTower(lowerCrane, 0, dimensions.hTower / 2 + dimensions.hBase, 0);

    lowerCrane.position.set(x, y, z);
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
    let hJib = dimensions.hDifference + dimensions.hJib / 2;

    upperCrane = new THREE.Object3D();

    // Referencial Filho: Eixo Rotatório
    upperCrane.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addSuperiorTowerPeak(
        upperCrane,
        0,
        dimensions.hInferiorTowerPeak + dimensions.hSuperiorTowerPeak / 2,
        0,
    );
    addInferiorTowerPeak(upperCrane, 0, dimensions.hInferiorTowerPeak / 2, 0);
    addJib(upperCrane, (dimensions.lTower + dimensions.cJib) / 2, hJib, 0);
    addCounterJib(
        upperCrane,
        (-dimensions.lTower - dimensions.cCounterJib) / 2,
        hJib,
        0,
    );
    addCounterWeight(
        upperCrane,
        (dimensions.cCounterWeight - dimensions.lTower) / 2 -
            dimensions.cCounterJib,
        hJib - dimensions.hJib,
        0,
    );
    addCab(
        upperCrane,
        0,
        dimensions.hDifference / 2,
        (dimensions.lTower + dimensions.lCab) / 2,
    );

    //addTurntable(upperCrane, x, y, z);

    upperCrane.position.set(x, y, z);

    upperCrane.rotateY(0);
}

function addSuperiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.ConeGeometry(
        dimensions.lTower * Math.sqrt(2) / 2,
        dimensions.hSuperiorTowerPeak,
        4,
    ).rotateY(3.925);
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

function addJib(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cJib,
        dimensions.hJib,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterJib(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cCounterJib,
        dimensions.hJib,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cCounterWeight,
        dimensions.hCounterWeight,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCab(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lTower,
        dimensions.lTower,
        dimensions.lCab,
    );
    mesh = new THREE.Mesh(geometry, materials.lightBlue);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createTrolley(x, y, z) {
    "use strict";

    trolley = new THREE.Object3D();
    // Referencial Neto: Carrinho
    trolley.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addTrolley(trolley, 0, -dimensions.hTrolley / 2, 0);
    addRope(trolley, 0, -(dimensions.hTrolley + dimensions.hRope / 2), 0);
    addClawBase(trolley, 0, -(dimensions.hTrolley + dimensions.hRope + dimensions.hClawBase / 2), 0);

    trolley.position.set(x, y, z);
}

function addTrolley(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cTrolley,
        dimensions.hTrolley,
        dimensions.lTower,
    );
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRope(obj, x, y, z) {
    "use strict";
    geometry = new THREE.CylinderGeometry(
        dimensions.rRope,
        dimensions.rRope,
        dimensions.hRope,
    );
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    mesh.name = 'rope';
    obj.add(mesh);
}

function addClawBase(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lClawBase,
        dimensions.hClawBase,
        dimensions.lClawBase,
    );
    mesh = new THREE.Mesh(geometry, materials.lightOrange);
    mesh.position.set(x, y, z);
    mesh.name = 'clawBase';
    obj.add(mesh);
}

function createClaw(x, y, z) {
    "use strict";

    claw = new THREE.Object3D();
    // Referencial Bisneto: Pinças da garra
    claw.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial

    claw.position.set(x, y, z);
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
    trolleyX = Math.min(trolleyX, MAX_TROLLEY_X);
    trolleyX = Math.max(trolleyX, MIN_TROLLEY_X);
    trolley.position.x = trolleyX;

    towerAngle = Math.min(towerAngle, MAX_TOWER_ANGLE);
    towerAngle = Math.max(towerAngle, MIN_TOWER_ANGLE);
    upperCrane.setRotationFromAxisAngle(Y_AXIS, towerAngle);

    ropeScale = Math.min(ropeScale, MAX_ROPE_SCALE);
    ropeScale = Math.max(ropeScale, MIN_ROPE_SCALE);
    dimensions.hRope = BASE_H_ROPE * ropeScale;
    let rope = trolley.getObjectByName('rope');
    rope.scale.y = ropeScale;
    rope.position.y = -(dimensions.hTrolley + dimensions.hRope / 2);
    trolley.getObjectByName('clawBase').position.y = -(dimensions.hTrolley + dimensions.hRope + dimensions.hClawBase / 2);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    "use strict";
    renderer.render(scene, currCamera);
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
    currCamera = broadPCamera;
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
        currCamera.aspect = window.innerWidth / window.innerHeight;
        currCamera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    "use strict";

    if (!pressedKeys.hasOwnProperty(e.key)) {
        return;
    }

    pressedKeys[e.key] = true;

    for (const key in pressedKeys) {
        if (pressedKeys[key]) {
            switch (key) {
                case '1':
                    currCamera = frontalCamera;
                    for (let material in materials) {
                        materials[material].wireframe = !materials[material].wireframe;
                    }
                    break;
                case '2':
                    currCamera = lateralCamera;
                    break;
                case '3':
                    currCamera = topCamera;
                    break;
                case '4':
                    currCamera = broadOCamera;
                    break;
                case '5':
                    currCamera = broadPCamera;
                    break;
                case '6':
                    currCamera = clawCamera;
                    break;
                case 'q':
                    towerAngle += 0.1;
                    break;
                case 'a':
                    towerAngle -= 0.1;
                    break;
                case 'w':
                    trolleyX += 1;
                    break;
                case 's':
                    trolleyX -= 1;
                    break;
                case 'e':
                    console.log(trolley);
                    ropeScale += 0.2;
                    break;
                case 'd':
                    ropeScale -= 0.2;
                    break;
            }
        }
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    "use strict";
    if (!pressedKeys.hasOwnProperty(e.key)) {
        return;
    }
    pressedKeys[e.key] = false;
}

init();
animate();
