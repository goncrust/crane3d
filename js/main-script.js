import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let curr_camera,
    lateral_camera,
    top_camera,
    frontal_camera,
    claw_camera,
    broad_p_camera,
    broad_o_camera;

let scene, renderer, geometry, mesh;

let crane, lowerCrane, upperCrane, trolley;

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
};

let maxClawHeight = -(dimensions.hTrolley + dimensions.hClawBase);
let claw;

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
        1000
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
        1000
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
        1000
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
        1000
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
        1000
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
        1000
    );
    broad_o_camera.position.set(75, 75, 75);
    broad_o_camera.lookAt(0, 50, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    let height_upperTower = dimensions.hBase + dimensions.hTower;
    let height_trolley = dimensions.hDifference;

    crane = new THREE.Object3D();

    createLowerCrane(0, 0, 0);
    crane.add(lowerCrane);

    createUpperCrane(0, height_upperTower, 0);
    lowerCrane.add(upperCrane);

    createTrolleyObject(dimensions.cJib / 2, height_trolley, 0);
    upperCrane.add(trolley);

    createClaw(0, -(dimensions.hTrolley + dimensions.hClawBase), 0);
    trolley.add(claw);

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
        dimensions.lBase
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
        dimensions.lTower
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
        0
    );
    addInferiorTowerPeak(upperCrane, 0, dimensions.hInferiorTowerPeak / 2, 0);
    addJib(upperCrane, (dimensions.lTower + dimensions.cJib) / 2, hJib, 0);
    addCounterJib(
        upperCrane,
        (-dimensions.lTower - dimensions.cCounterJib) / 2,
        hJib,
        0
    );
    addCounterWeight(
        upperCrane,
        (dimensions.cCounterWeight - dimensions.lTower) / 2 -
            dimensions.cCounterJib,
        hJib - dimensions.hJib,
        0
    );
    addCab(
        upperCrane,
        0,
        dimensions.hDifference / 2,
        (dimensions.lTower + dimensions.lCab) / 2
    );

    //addTurntable(upperCrane, x, y, z);


    upperCrane.position.set(x, y, z);

    upperCrane.rotateY(0);
}

function addSuperiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.ConeGeometry(
        (dimensions.lTower * 3) / 4,
        dimensions.hSuperiorTowerPeak,
        4
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
        dimensions.lTower
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
        dimensions.lTower
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
        dimensions.lTower
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
        dimensions.lTower
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
        dimensions.lCab
    );
    mesh = new THREE.Mesh(geometry, materials.lightBlue);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createTrolleyObject(x, y, z) {
    "use strict";

    trolley = new THREE.Object3D();
    // Referencial Neto: Carrinho
    trolley.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addTrolley(trolley, 0, -dimensions.hTrolley / 2, 0);
    //addClawBase(trolley, 0, maxClawHeight, 0);


    trolley.position.set(x, y, z);
}

function addTrolley(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.cTrolley,
        dimensions.hTrolley,
        dimensions.lTower
    );
    mesh = new THREE.Mesh(geometry, materials.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createClaw(x, y, z) {
    "use strict";

    claw = new THREE.Object3D();

    // Referencial Neto: Carrinho
    claw.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addClawBase(claw, 0, dimensions.hClawBase / 2, 0);


    claw.position.set(x, y, z);
}

function addClawBase(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        dimensions.lClawBase,
        dimensions.hClawBase,
        dimensions.lClawBase
    );
    mesh = new THREE.Mesh(geometry, materials.lightOrange);
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
            for (let material in materials) {
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
        case 81: //q
            upperCrane.rotateY(0.1);
            break;
        case 65: //a
            upperCrane.rotateY(-0.1);
            break;
        case 87: //w
            let max_x =
                dimensions.cJib +
                dimensions.lTower / 2 -
                dimensions.cTrolley / 2;
            if (trolley.position.x < max_x)
                trolley.position.x = Math.min(trolley.position.x + 1, max_x);
            break;
        case 83: //s
            let min_x = dimensions.lTower / 2 + dimensions.cTrolley / 2;
            if (trolley.position.x > min_x)
                trolley.position.x = Math.max(trolley.position.x - 1, min_x);
            break;
        case 69: //e
            if (claw.position.y < maxClawHeight)
                claw.position.y = Math.min(claw.position.y + 1, maxClawHeight);
            break;
        case 68: //d
            let minClawHeight = maxClawHeight - dimensions.hTower;
            if (claw.position.y > minClawHeight)
                claw.position.y = Math.max(claw.position.y - 1, minClawHeight);
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
