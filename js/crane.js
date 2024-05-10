import * as THREE from "three";
import { DIMENSIONS, MATERIALS } from "./constants.js";
import { scene } from "./main-script.js";
export {
    createCrane,
    claw,
    ropeScale,
    trolleyX,
    towerAngle,
    clawY,
    fingerAngle,
    trolley,
    upperCrane,
    trolleyMixer,
    clawFingerMixers,
    upperCraneMixer,
    clawBoundingBox,
};

let crane, lowerCrane, upperCrane, trolley, claw;

let geometry, mesh;

let ropeScale, trolleyX, towerAngle, clawY, fingerAngle;

let clawBoundingBox;

let trolleyMixer,
    clawFingerMixers = [],
    upperCraneMixer;

export function modifyRopeScale(x) {
    ropeScale = x;
}

export function modifyTrolleyX(x) {
    trolleyX = x;
}

export function modifyTowerAngle(x) {
    towerAngle = x;
}

export function modifyClawY(x) {
    clawY = x;
}

export function modifyFingerAngle(x) {
    fingerAngle = x;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrane() {
    "use strict";

    let heightUpperTower = DIMENSIONS.hBase + DIMENSIONS.hTower;
    let heightTrolley = DIMENSIONS.hDifference;

    ropeScale = 1;
    trolleyX = DIMENSIONS.cJib / 2;
    towerAngle = 0;
    clawY = -DIMENSIONS.hRope - DIMENSIONS.hTrolley - DIMENSIONS.hClawBase;
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

    addBase(lowerCrane, 0, DIMENSIONS.hBase / 2, 0);
    addTower(lowerCrane, 0, DIMENSIONS.hTower / 2 + DIMENSIONS.hBase, 0);

    lowerCrane.position.set(x, y, z);
}

function addBase(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.lBase,
        DIMENSIONS.hBase,
        DIMENSIONS.lBase,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTower(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.lTower,
        DIMENSIONS.hTower,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.lightOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createUpperCrane(x, y, z) {
    "use strict";
    let hJib = DIMENSIONS.hDifference + DIMENSIONS.hJib / 2;

    upperCrane = new THREE.Object3D();

    // Referencial Filho: Eixo Rotatório
    //upperCrane.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addSuperiorTowerPeak(
        upperCrane,
        0,
        DIMENSIONS.hInferiorTowerPeak + DIMENSIONS.hSuperiorTowerPeak / 2,
        0,
    );
    addInferiorTowerPeak(upperCrane, 0, DIMENSIONS.hInferiorTowerPeak / 2, 0);
    addJib(upperCrane, (DIMENSIONS.lTower + DIMENSIONS.cJib) / 2, hJib, 0);
    addCounterJib(
        upperCrane,
        (-DIMENSIONS.lTower - DIMENSIONS.cCounterJib) / 2,
        hJib,
        0,
    );
    addCounterWeight(
        upperCrane,
        (DIMENSIONS.cCounterWeight - DIMENSIONS.lTower) / 2 -
            DIMENSIONS.cCounterJib,
        hJib - DIMENSIONS.hJib,
        0,
    );
    addCab(
        upperCrane,
        0,
        DIMENSIONS.hDifference / 2,
        (DIMENSIONS.lTower + DIMENSIONS.lCab) / 2,
    );

    let pointA = new THREE.Vector3(0, DIMENSIONS.hInferiorTowerPeak, 0);
    let pointB = new THREE.Vector3(
        DIMENSIONS.cJib / 2,
        DIMENSIONS.hDifference,
        0,
    );
    let pointC = new THREE.Vector3(
        -DIMENSIONS.cJib / 2,
        DIMENSIONS.hDifference,
        0,
    );
    let direction = new THREE.Vector3().subVectors(pointA, pointB);

    addFrontPendant(
        upperCrane,
        DIMENSIONS.cJib / 4,
        DIMENSIONS.hInferiorTowerPeak,
        0,
        direction,
    );

    direction = new THREE.Vector3().subVectors(pointA, pointC);

    addRearPendant(
        upperCrane,
        -DIMENSIONS.cCounterJib / 2,
        DIMENSIONS.hInferiorTowerPeak,
        0,
        direction,
    );

    upperCrane.position.set(x, y, z);
    upperCraneMixer = new THREE.AnimationMixer(upperCrane);
}

function addFrontPendant(obj, x, y, z, direction) {
    "use strict";

    geometry = new THREE.CylinderGeometry(
        DIMENSIONS.rPendant,
        DIMENSIONS.rPendant,
        direction.length(),
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.purple);
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
        DIMENSIONS.rPendant,
        DIMENSIONS.rPendant,
        direction.length(),
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.purple);
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
        (DIMENSIONS.lTower * Math.sqrt(2)) / 2,
        DIMENSIONS.hSuperiorTowerPeak,
        4,
    ).rotateY(3.925);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addInferiorTowerPeak(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.lTower,
        DIMENSIONS.hInferiorTowerPeak,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addJib(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.cJib,
        DIMENSIONS.hJib,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterJib(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.cCounterJib,
        DIMENSIONS.hJib,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.cCounterWeight,
        DIMENSIONS.hCounterWeight,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCab(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.lTower,
        DIMENSIONS.lTower,
        DIMENSIONS.lCab,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.lightBlue);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createTrolley(x, y, z) {
    "use strict";

    trolley = new THREE.Object3D();
    // Referencial Neto: Carrinho
    //trolley.add(new THREE.AxesHelper(10));

    // Posições relativas ao novo referencial
    addTrolley(trolley, 0, -DIMENSIONS.hTrolley / 2, 0);
    addRope(trolley, 0, -(DIMENSIONS.hTrolley + DIMENSIONS.hRope / 2), 0);
    addClawBase(
        trolley,
        0,
        -(DIMENSIONS.hTrolley + DIMENSIONS.hRope + DIMENSIONS.hClawBase / 2),
        0,
    );

    trolley.position.set(x, y, z);
    trolleyMixer = new THREE.AnimationMixer(trolley);
}

function addTrolley(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.cTrolley,
        DIMENSIONS.hTrolley,
        DIMENSIONS.lTower,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.grey);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRope(obj, x, y, z) {
    "use strict";
    geometry = new THREE.CylinderGeometry(
        DIMENSIONS.rRope,
        DIMENSIONS.rRope,
        DIMENSIONS.hRope,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.grey);
    mesh.position.set(x, y, z);
    mesh.name = "rope";
    obj.add(mesh);
}

function addClawBase(obj, x, y, z) {
    "use strict";
    geometry = new THREE.BoxGeometry(
        DIMENSIONS.lClawBase,
        DIMENSIONS.hClawBase,
        DIMENSIONS.lClawBase,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.lightOrange);
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

    mesh = new THREE.Mesh(geometry, MATERIALS.pink);
    mesh.position.set(x, y, z);

    clawFingerMixers.push(new THREE.AnimationMixer(mesh));

    obj.add(mesh);
}
