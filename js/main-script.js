import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
//import { convertArray } from "three/src/animation/AnimationUtils";

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

let clawBoundingBox,
    crateBounds = [];

let crates = [],
    container;

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
    redBrown: new THREE.MeshBasicMaterial({
        color: 0xa52a2a,
        wireframe: false,
    }),
    coffeeBrown: new THREE.MeshBasicMaterial({
        color: 0x6f4e37,
        wireframe: false,
    }),
    pink: new THREE.MeshBasicMaterial({
        color: 0xff1493,
        wireframe: false,
        side: THREE.DoubleSide,
    }),
    purple: new THREE.MeshBasicMaterial({
        color: 0xb600ff,
        wireframe: false,
        side: THREE.DoubleSide,
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
    hClawBase: 1,
    lClaw: 2,
    hClaw: 0,
    rRope: 0.5,
    hRope: BASE_H_ROPE,
    rPendant: 0.1,
    lFrontPendant: 20,
    lRearPendant: 0,
};

const BIND_INFORMATION = [
    {
        key: "1",
        description: "Frontal camera",
    },
    {
        key: "2",
        description: "Lateral camera",
    },
    {
        key: "3",
        description: "Top camera",
    },
    {
        key: "4",
        description: "Broad ortographic camera",
    },
    {
        key: "5",
        description: "Broad prespective camera",
    },
    {
        key: "6",
        description: "Claw camera",
    },
    {
        key: "7",
        description: "Toggle wireframe",
    },
    {
        key: "q",
        description: "Rotate tower counter-clockwise",
    },
    {
        key: "a",
        description: "Rotate tower clockwise",
    },
    {
        key: "w",
        description: "Move trolley forward",
    },
    {
        key: "s",
        description: "Move trolley backwards",
    },
    {
        key: "e",
        description: "Move claw up",
    },
    {
        key: "d",
        description: "Move claw down",
    },
    {
        key: "r",
        description: "Open claw",
    },
    {
        key: "f",
        description: "Close claw",
    },
];

let pressedKeys = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    q: false,
    a: false,
    w: false,
    s: false,
    e: false,
    d: false,
    r: false,
    f: false,
};

const MAX_TROLLEY_X =
    dimensions.cJib + dimensions.lTower / 2 - dimensions.cTrolley / 2;
const MIN_TROLLEY_X = dimensions.lTower / 2 + dimensions.cTrolley / 2;

const MIN_ROPE_SCALE = 0;
const MAX_ROPE_SCALE =
    (dimensions.hTower + dimensions.hDifference - dimensions.hTrolley) /
    BASE_H_ROPE;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const MIN_TOWER_ANGLE = 0;
const MAX_TOWER_ANGLE = Math.PI;

const MAX_CLAW_Y = -dimensions.hTrolley - dimensions.hClawBase;

const MIN_CLAW_Y =
    -dimensions.hDifference - dimensions.hTower - dimensions.hClawBase;

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const MIN_FINGER_ANGLE = 0;
const MAX_FINGER_ANGLE = Math.PI / 4;

let ropeScale, trolleyX, towerAngle, clawY, fingerAngle;

const clock = new THREE.Clock();
let trolleyMixer,
    clawFingerMixers = [],
    upperCraneMixer;
let isAnimating = false;

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
    createContainer();
    createCrates();
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
    claw.add(clawCamera);
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

function createHud() {
    "use strict";
    let hud = document.createElement("div");
    hud.className = "hud";
    addBindInfo(hud);
    document.body.appendChild(hud);
}

function addBindInfo(domObj) {
    "use strict";
    let binds = document.createElement("div");
    binds.className = "binds";
    BIND_INFORMATION.map((info) => addBindIndication(binds, info));
    domObj.appendChild(binds);
}

function addBindIndication(domObj, bindInformation) {
    "use strict";
    const { key, description } = bindInformation;
    let bindIndication = document.createElement("div");
    bindIndication.id = key;
    bindIndication.innerText = `${key} - ${description}`;
    domObj.appendChild(bindIndication);
}

function createCrane() {
    "use strict";

    let heightUpperTower = dimensions.hBase + dimensions.hTower;
    let heightTrolley = dimensions.hDifference;

    ropeScale = 1;
    trolleyX = dimensions.cJib / 2;
    towerAngle = 0;
    clawY = -dimensions.hRope - dimensions.hTrolley - dimensions.hClawBase;
    fingerAngle = 0;

    crane = new THREE.Object3D();

    createLowerCrane(0, 0, 0);
    crane.add(lowerCrane);

    createUpperCrane(0, heightUpperTower, 0);
    lowerCrane.add(upperCrane);

    createTrolley(trolleyX, heightTrolley, 0);
    upperCrane.add(trolley);

    createClaw(0, clawY, 0);
    trolley.add(claw);

    scene.add(crane);
}

function createLowerCrane(x, y, z) {
    "use strict";

    lowerCrane = new THREE.Object3D();

    //lowerCrane.add(new THREE.AxesHelper(10));

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
    //upperCrane.add(new THREE.AxesHelper(10));

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

    let pointA = new THREE.Vector3(0, dimensions.hInferiorTowerPeak, 0);
    let pointB = new THREE.Vector3(
        dimensions.cJib / 2,
        dimensions.hDifference,
        0,
    );
    let pointC = new THREE.Vector3(
        -dimensions.cJib / 2,
        dimensions.hDifference,
        0,
    );
    let direction = new THREE.Vector3().subVectors(pointA, pointB);

    addFrontPendant(
        upperCrane,
        dimensions.cJib / 4,
        dimensions.hInferiorTowerPeak,
        0,
        direction,
    );

    direction = new THREE.Vector3().subVectors(pointA, pointC);

    addRearPendant(
        upperCrane,
        -dimensions.cCounterJib / 2,
        dimensions.hInferiorTowerPeak,
        0,
        direction,
    );

    upperCrane.position.set(x, y, z);
    upperCraneMixer = new THREE.AnimationMixer(upperCrane);
}

function addFrontPendant(obj, x, y, z, direction) {
    "use strict";

    geometry = new THREE.CylinderGeometry(
        dimensions.rPendant,
        dimensions.rPendant,
        direction.length(),
    );
    mesh = new THREE.Mesh(geometry, materials.purple);
    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
    );

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRearPendant(obj, x, y, z, direction) {
    "use strict";

    geometry = new THREE.CylinderGeometry(
        dimensions.rPendant,
        dimensions.rPendant,
        direction.length(),
    );
    mesh = new THREE.Mesh(geometry, materials.purple);
    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
    );

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addSuperiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.ConeGeometry(
        (dimensions.lTower * Math.sqrt(2)) / 2,
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
    //trolley.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addTrolley(trolley, 0, -dimensions.hTrolley / 2, 0);
    addRope(trolley, 0, -(dimensions.hTrolley + dimensions.hRope / 2), 0);
    addClawBase(
        trolley,
        0,
        -(dimensions.hTrolley + dimensions.hRope + dimensions.hClawBase / 2),
        0,
    );

    trolley.position.set(x, y, z);
    trolleyMixer = new THREE.AnimationMixer(trolley);
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
    mesh.name = "rope";
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
    mesh.name = "clawBase";
    obj.add(mesh);
}

function createClaw(x, y, z) {
    "use strict";

    claw = new THREE.Object3D();
    // Referencial Bisneto: Pinças da garra
    //claw.add(new THREE.AxesHelper(10));
    // Posições relativas ao novo referencial
    addClawFinger(claw, 0, 0, 0, 0);
    addClawFinger(claw, 0, 0, 0, Math.PI);
    addClawFinger(claw, 0, 0, 0, Math.PI / 2);
    addClawFinger(claw, 0, 0, 0, -Math.PI / 2);

    clawBoundingBox = new THREE.Box3();
    clawBoundingBox.setFromObject(claw, true);

    claw.position.set(x, y, z);
}

function addClawFinger(obj, x, y, z, rot) {
    "use strict";
    let scaler = 0.4;

    geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
        0,
        0,
        0, // 0
        0,
        -2,
        0, // 1
        5,
        -5,
        0, // 2
        3.5,
        -5,
        0, // 3
        3,
        -10,
        0, // 4
        1,
        -12,
        0, // 5
        0,
        0,
        2, // 6 - 0
        0,
        -2,
        2, // 7 - 1
        5,
        -5,
        2, // 8 - 2
        3.5,
        -5,
        2, // 9 - 3
        3,
        -10,
        2, // 10 - 4
        3,
        -10,
        2, // 11 - 5
    ]);

    const indices = [
        // 0-1-6-7 Square
        0, 1, 6, 1, 6, 7,
        // 0-1-2-3 Rectangle
        0, 1, 2, 1, 2, 3,
        // 0-2-6-8 Rectangle
        0, 2, 6, 2, 6, 8,
        // 1-3-7-9 Rectangle
        1, 3, 7, 3, 7, 9,
        // 2-3-8-9 Square
        2, 3, 8, 3, 8, 9,
        // 2-3-4-5 Rectangle
        2, 3, 4, 3, 4, 5,
        // 8-9-10-11 Rectangle
        8, 9, 10, 9, 10, 11,
        // 3-5-9-11 Rectangle
        3, 5, 9, 5, 9, 11,
        // 4-5-10-11 Square
        4, 5, 10, 5, 10, 11,
    ];

    vertices = vertices.map((x) => x * scaler);

    geometry.setIndex(indices);
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.rotateY(rot);

    mesh = new THREE.Mesh(geometry, materials.pink);
    mesh.position.set(x, y, z);

    clawFingerMixers.push(new THREE.AnimationMixer(mesh));

    obj.add(mesh);
}

function createCrates() {
    "use strict";
    crates.push(new THREE.Object3D());
    let pos = new THREE.Vector3(20, 0, -10);
    let dim = new THREE.Vector3(5, 5, 5);
    let rot = 1;
    addCrate(crates[0], pos, dim, rot, materials.coffeeBrown);

    crates.push(new THREE.Object3D());
    pos = new THREE.Vector3(10, 0, -20);
    dim = new THREE.Vector3(5, 5, 5);
    rot = 0;
    addCrate(crates[1], pos, dim, rot, materials.redBrown);

    scene.add(crates[0]);
    scene.add(crates[1]);
}

function addCrate(obj, pos, dim, rot, color) {
    "use strict";
    geometry = new THREE.BoxGeometry(dim.x, dim.y, dim.z);
    mesh = new THREE.Mesh(geometry, color);
    mesh.rotation.y = rot;
    mesh.position.set(pos.x, pos.y + dim.y / 2, pos.z);
    mesh.geometry.computeBoundingBox();
    obj.add(mesh);

    let crateBoundingSphere = new THREE.Sphere();
    const crateBoundingBox = new THREE.Box3();
    crateBoundingBox.setFromObject(mesh, true);
    crateBoundingBox.getBoundingSphere(crateBoundingSphere);
    crateBounds.push({ box: crateBoundingBox, sphere: crateBoundingSphere });
}

function createContainer() {
    "use strict";
    container = new THREE.Object3D();
    let lContainer = 80;
    let hContainer = 10;
    let cContainer = 60;
    let thickness = 1;

    // X Walls
    let pos = new THREE.Vector3(-50, 0, -30);
    let dim = new THREE.Vector3(lContainer, hContainer, thickness);
    let rot = 0;
    addWall(container, pos, dim, rot, materials.coffeeBrown);

    pos = new THREE.Vector3(-50, 0, 30);
    dim = new THREE.Vector3(lContainer, hContainer, thickness);
    rot = 0;
    addWall(container, pos, dim, rot, materials.coffeeBrown);

    // Z Walls
    pos = new THREE.Vector3(-10.5, 0, 0);
    dim = new THREE.Vector3(cContainer, hContainer, thickness);
    rot = Math.PI / 2;
    addWall(container, pos, dim, rot, materials.coffeeBrown);

    pos = new THREE.Vector3(-89.5, 0, 0);
    dim = new THREE.Vector3(cContainer, hContainer, thickness);
    rot = Math.PI / 2;
    addWall(container, pos, dim, rot, materials.coffeeBrown);

    // Floor
    pos = new THREE.Vector3(-50, 0, 0);
    dim = new THREE.Vector3(lContainer - 1, thickness, cContainer);
    rot = 0;
    addWall(container, pos, dim, rot, materials.grey);

    scene.add(container);
}

function addWall(obj, pos, dim, rot, color) {
    "use strict";
    geometry = new THREE.BoxGeometry(dim.x, dim.y, dim.z);
    mesh = new THREE.Mesh(geometry, color);
    mesh.rotation.y = rot;
    mesh.position.set(pos.x, pos.y + dim.y / 2, pos.z);
    obj.add(mesh);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    "use strict";
    if (isAnimating) return;
    let clawBoundingSphere = new THREE.Sphere();
    clawBoundingBox.setFromObject(claw, true);
    clawBoundingBox.getBoundingSphere(clawBoundingSphere);

    for (let i = 0; i < crateBounds.length; i++) {
        if (clawBoundingSphere.intersectsSphere(crateBounds[i].sphere)) {
            if (clawBoundingBox.intersectsBox(crateBounds[i].box)) {
                isAnimating = true;
                handleCollisions(crates[i]);
            }
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(crateObj) {
    "use strict";
    const quaternions = [
        new THREE.Quaternion().setFromAxisAngle(Z_AXIS, MAX_FINGER_ANGLE),
        new THREE.Quaternion().setFromAxisAngle(Z_AXIS, -MAX_FINGER_ANGLE),
        new THREE.Quaternion().setFromAxisAngle(X_AXIS, MAX_FINGER_ANGLE),
        new THREE.Quaternion().setFromAxisAngle(X_AXIS, -MAX_FINGER_ANGLE),
    ];

    let crate = crateObj.children[0];

    for (let i = 0; i < clawFingerMixers.length; i++) {
        animateClawFinger(
            claw.children[i],
            clawFingerMixers[i],
            quaternions[i],
            crate,
        );
    }
}

function animateClawFinger(finger, mixer, max_quaternion, crate) {
    "use strict";
    const times = [0, 1];
    const values = [
        ...finger.quaternion.toArray(),
        ...max_quaternion.toArray(),
    ];

    const openClawFingerKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion",
        times,
        values,
    );
    const openClawFingerClip = new THREE.AnimationClip("open-claw", -1, [
        openClawFingerKF,
    ]);
    const openClawFingerAction = mixer.clipAction(openClawFingerClip);
    openClawFingerAction.setLoop(THREE.LoopOnce);
    openClawFingerAction.clampWhenFinished = true;
    mixer.addEventListener("finished", function (e) {
        crate.position.x = 0;
        crate.position.y = -4;
        crate.position.z = 0;
        claw.add(crate);
        animateTrolley(crate);
    });
    openClawFingerAction.play();
    fingerAngle = MAX_FINGER_ANGLE;
}

function animateUpperCraneRotation(crate) {
    const times = [0, 2];
    let max_quaternion = new THREE.Quaternion().setFromAxisAngle(
        Y_AXIS,
        MAX_TOWER_ANGLE,
    );
    const values = [
        ...upperCrane.quaternion.toArray(),
        ...max_quaternion.toArray(),
    ];

    const upperCraneRotationKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion",
        times,
        values,
    );
    const upperCraneRotationClip = new THREE.AnimationClip(
        "crane-rotation",
        -1,
        [upperCraneRotationKF],
    );
    const upperCraneRotationAction = upperCraneMixer.clipAction(
        upperCraneRotationClip,
    );
    upperCraneRotationAction.setLoop(THREE.LoopOnce);
    upperCraneRotationAction.clampWhenFinished = true;
    upperCraneMixer.addEventListener("finished", function (e) {
        claw.remove(crate);
        isAnimating = false;
    });
    upperCraneRotationAction.play();
    towerAngle = MAX_TOWER_ANGLE;
}

function animateTrolley(crate) {
    "use strict";
    const times = [0, 1];
    const values = [
        trolley.position.x,
        trolley.position.y,
        trolley.position.z,
        MAX_TROLLEY_X,
        trolley.position.y,
        trolley.position.z,
    ];

    const moveTrolleyKF = new THREE.VectorKeyframeTrack(
        ".position",
        times,
        values,
    );
    const moveTrolleyClip = new THREE.AnimationClip("forward", -1, [
        moveTrolleyKF,
    ]);
    const moveTrolleyAction = trolleyMixer.clipAction(moveTrolleyClip);
    moveTrolleyAction.setLoop(THREE.LoopOnce);
    moveTrolleyAction.clampWhenFinished = true;
    trolleyMixer.addEventListener("finished", function (e) {
        animateUpperCraneRotation(crate);
    });
    moveTrolleyAction.play();
    trolleyX = MAX_TROLLEY_X;
}

////////////
/* UPDATE */
////////////
function update() {
    "use strict";
    keyUpdate();
    updateClawCamera();
    updateHUD();

    trolleyX = Math.min(trolleyX, MAX_TROLLEY_X);
    trolleyX = Math.max(trolleyX, MIN_TROLLEY_X);
    trolley.position.x = trolleyX;

    towerAngle = Math.min(towerAngle, MAX_TOWER_ANGLE);
    towerAngle = Math.max(towerAngle, MIN_TOWER_ANGLE);
    upperCrane.setRotationFromAxisAngle(Y_AXIS, towerAngle);

    ropeScale = Math.min(ropeScale, MAX_ROPE_SCALE);
    ropeScale = Math.max(ropeScale, MIN_ROPE_SCALE);
    dimensions.hRope = BASE_H_ROPE * ropeScale;
    let rope = trolley.getObjectByName("rope");
    rope.scale.y = ropeScale;
    rope.position.y = -(dimensions.hTrolley + dimensions.hRope / 2);
    trolley.getObjectByName("clawBase").position.y = -(
        dimensions.hTrolley +
        dimensions.hRope +
        dimensions.hClawBase / 2
    );

    clawY = Math.min(clawY, MAX_CLAW_Y);
    clawY = Math.max(clawY, MIN_CLAW_Y);
    claw.position.y = clawY;

    fingerAngle = Math.min(fingerAngle, MAX_FINGER_ANGLE);
    fingerAngle = Math.max(fingerAngle, MIN_FINGER_ANGLE);
    // TODO: Atualizar estes índices quando removermos o axes helper
    claw.children[0].setRotationFromAxisAngle(Z_AXIS, fingerAngle);
    claw.children[1].setRotationFromAxisAngle(Z_AXIS, -fingerAngle);
    claw.children[2].setRotationFromAxisAngle(X_AXIS, fingerAngle);
    claw.children[3].setRotationFromAxisAngle(X_AXIS, -fingerAngle);

    const delta = clock.getDelta();
    for (const mixer of clawFingerMixers) {
        mixer.update(delta);
    }
    trolleyMixer.update(delta);
    upperCraneMixer.update(delta);

    checkCollisions();
}

function keyUpdate() {
    let scaler = 0.3;
    for (const key in pressedKeys) {
        if (pressedKeys[key]) {
            switch (key) {
                case "1":
                    currCamera = frontalCamera;
                    pressedKeys[key] = false;
                    break;
                case "2":
                    currCamera = lateralCamera;
                    pressedKeys[key] = false;
                    break;
                case "3":
                    currCamera = topCamera;
                    pressedKeys[key] = false;
                    break;
                case "4":
                    currCamera = broadOCamera;
                    pressedKeys[key] = false;
                    break;
                case "5":
                    currCamera = broadPCamera;
                    pressedKeys[key] = false;
                    break;
                case "6":
                    currCamera = clawCamera;
                    pressedKeys[key] = false;
                    break;
                case "7":
                    for (let material in materials) {
                        materials[material].wireframe =
                            !materials[material].wireframe;
                    }
                    pressedKeys[key] = false;
                    break;
            }
            if (!isAnimating) {
                switch (key) {
                    case "q":
                        towerAngle += scaler * 0.1;
                        break;
                    case "a":
                        towerAngle -= scaler * 0.1;
                        break;
                    case "w":
                        trolleyX += scaler * 1;
                        break;
                    case "s":
                        trolleyX -= scaler * 1;
                        break;
                    case "e":
                        ropeScale -= scaler * 0.2;
                        clawY += scaler * 1;
                        break;
                    case "d":
                        ropeScale += scaler * 0.2;
                        clawY -= scaler * 1;
                        break;
                    case "r":
                        fingerAngle += scaler * 0.1;
                        break;
                    case "f":
                        fingerAngle -= scaler * 0.1;
                        break;
                }
            }
        }
    }
}

function updateClawCamera() {
    "use strict";
    let clawWorldPosition = claw.position.clone();
    clawWorldPosition.applyMatrix4(claw.matrixWorld);
    clawCamera.lookAt(clawWorldPosition.x, 0, clawWorldPosition.z);
}

function updateHUD() {
    "use strict";
    for (const key in pressedKeys) {
        let domElement = document.getElementById(key);
        if (!!domElement) {
            if (!isFinite(key)) {
                domElement.className = pressedKeys[key] ? "active" : "";
            } else {
                domElement.className = "";
            }
        }
    }
    if (materials.coffeeBrown.wireframe == true)
        document.getElementById("7").className = "active";

    switch (currCamera) {
        case frontalCamera:
            document.getElementById("1").className = "active";
            break;
        case lateralCamera:
            document.getElementById("2").className = "active";
            break;
        case topCamera:
            document.getElementById("3").className = "active";
            break;
        case broadOCamera:
            document.getElementById("4").className = "active";
            break;
        case broadPCamera:
            document.getElementById("5").className = "active";
            break;
        case clawCamera:
            document.getElementById("6").className = "active";
            break;
    }
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
    createHud();
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

    pressedKeys[e.key] = isFinite(e.key) ? !e.repeat : true;
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
