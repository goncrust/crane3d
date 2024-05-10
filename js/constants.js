import * as THREE from "three";

export {
    MATERIALS,
    BASE_H_ROPE,
    DIMENSIONS,
    BIND_INFORMATION,
    MAX_TROLLEY_X,
    MIN_TROLLEY_X,
    MIN_ROPE_SCALE,
    MAX_ROPE_SCALE,
    Y_AXIS,
    MIN_TOWER_ANGLE,
    MAX_TOWER_ANGLE,
    MAX_CLAW_Y,
    MIN_CLAW_Y,
    X_AXIS,
    Z_AXIS,
    MIN_FINGER_ANGLE,
    MAX_FINGER_ANGLE,
};

const MATERIALS = {
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
    red: new THREE.MeshBasicMaterial({
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

const DIMENSIONS = {
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

const MAX_TROLLEY_X =
    DIMENSIONS.cJib + DIMENSIONS.lTower / 2 - DIMENSIONS.cTrolley / 2;
const MIN_TROLLEY_X = DIMENSIONS.lTower / 2 + DIMENSIONS.cTrolley / 2;

const MIN_ROPE_SCALE = 0;
const MAX_ROPE_SCALE =
    (DIMENSIONS.hTower + DIMENSIONS.hDifference - DIMENSIONS.hTrolley) /
    BASE_H_ROPE;

const MIN_TOWER_ANGLE = 0;
const MAX_TOWER_ANGLE = Math.PI;

const MAX_CLAW_Y = -DIMENSIONS.hTrolley - DIMENSIONS.hClawBase;

const MIN_CLAW_Y =
    -DIMENSIONS.hDifference - DIMENSIONS.hTower - DIMENSIONS.hClawBase;

const MIN_FINGER_ANGLE = 0;
const MAX_FINGER_ANGLE = Math.PI / 4;

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
