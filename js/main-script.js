import * as THREE from "three";
import { createCameras } from "./cameras.js";
import {
    createCrane,
    claw,
    trolleyX,
    towerAngle,
    clawY,
    fingerAngle,
    modifyClawY,
    modifyFingerAngle,
    modifyRopeScale,
    modifyTowerAngle,
    modifyTrolleyX,
    trolley,
    upperCrane,
    ropeScale,
} from "./crane.js";
import { createContainer, createCrates, removeCrate, crates } from "./crates.js";
import { bindEvents, pressedKeys } from "./events.js";
import { createHud } from "./hud.js";
import {
    DIMENSIONS,
    MATERIALS,
    MAX_TROLLEY_X,
    MIN_TROLLEY_X,
    MAX_TOWER_ANGLE,
    MIN_TOWER_ANGLE,
    MAX_ROPE_SCALE,
    MIN_ROPE_SCALE,
    BASE_H_ROPE,
    MAX_CLAW_Y,
    MIN_CLAW_Y,
    MAX_FINGER_ANGLE,
    MIN_FINGER_ANGLE,
    X_AXIS,
    Y_AXIS,
    Z_AXIS,
} from "./constants.js";
import {
    lateralCamera,
    topCamera,
    frontalCamera,
    clawCamera,
    broadPCamera,
    broadOCamera,
} from "./cameras.js";
import { checkCollisions, isAnimating, updateIsAnimating, colidedCrate, updateColidedCrate } from "./colisions.js";
export { scene };

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let crateMesh;
let scene, renderer;
let currCamera;

let phases = Array(4).fill(false);
phases[0] = true;

const clock = new THREE.Clock();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    "use strict";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fe2bf);
    //scene.add(new THREE.AxesHelper(10));

    createCrane();
    createContainer();
    createCrates();
}

////////////
/* UPDATE */
////////////
function update() {
    if (isAnimating) {
        animationUpdate();
    } else {
        standardUpdate();
    }
}

function animationUpdate() {
    const delta = clock.getDelta();

    if (phases[0] && fingerAngle != MAX_FINGER_ANGLE) {

        modifyFingerAngle(fingerAngle + 2 * delta);
        modifyFingerAngle(Math.min(fingerAngle, MAX_FINGER_ANGLE));

        claw.children[0].setRotationFromAxisAngle(Z_AXIS, fingerAngle);
        claw.children[1].setRotationFromAxisAngle(Z_AXIS, -fingerAngle);
        claw.children[2].setRotationFromAxisAngle(X_AXIS, fingerAngle);
        claw.children[3].setRotationFromAxisAngle(X_AXIS, -fingerAngle);

    } else if (phases[0]) {
        phases[0] = false;
        phases[1] = true;
    } else if (phases[1] && ropeScale != MIN_ROPE_SCALE) {

        if (colidedCrate > -1) {
            const crate = crates[colidedCrate];
            removeCrate(colidedCrate);
            updateColidedCrate(-1);

            crateMesh = crate.children[0];
            scene.remove(crate);

            crateMesh.position.set(0, -1 -crate.height/2, 0);
            claw.add(crateMesh);
        }

        modifyRopeScale(ropeScale - 2 * delta);
        modifyRopeScale(Math.max(ropeScale, MIN_ROPE_SCALE));
        let hRope = BASE_H_ROPE * ropeScale;
        let rope = trolley.getObjectByName("rope");
        rope.scale.y = ropeScale;
        rope.position.y = -(DIMENSIONS.hTrolley + hRope / 2);
        trolley.getObjectByName("clawBase").position.y = -(
            DIMENSIONS.hTrolley +
            hRope +
            DIMENSIONS.hClawBase / 2
        );

        modifyClawY(clawY + 10 * delta);
        modifyClawY(Math.min(clawY, MAX_CLAW_Y));
        claw.position.y = clawY;

    } else if (phases[1]) {
        phases[1] = false;
        phases[2] = true;
    } else if (phases[2] && towerAngle != MAX_TOWER_ANGLE) {

        modifyTowerAngle(towerAngle + 2 * delta);
        modifyTowerAngle(Math.min(towerAngle, MAX_TOWER_ANGLE));
        upperCrane.setRotationFromAxisAngle(Y_AXIS, towerAngle);

    } else if (phases[2]) {
        phases[2] = false;
        phases[3] = true;
    } else if (phases[3] && ropeScale != MAX_ROPE_SCALE) {

        modifyRopeScale(ropeScale + 2 * delta);
        modifyRopeScale(Math.min(ropeScale, MAX_ROPE_SCALE));
        let hRope = BASE_H_ROPE * ropeScale;
        let rope = trolley.getObjectByName("rope");
        rope.scale.y = ropeScale;
        rope.position.y = -(DIMENSIONS.hTrolley + hRope / 2);
        trolley.getObjectByName("clawBase").position.y = -(
            DIMENSIONS.hTrolley +
            hRope +
            DIMENSIONS.hClawBase / 2
        );

        modifyClawY(clawY - 10 * delta);
        modifyClawY(Math.max(clawY, MIN_CLAW_Y));
        claw.position.y = clawY;

    } else if (phases[3]) {
        phases[3] = false
    } else {
        updateIsAnimating(false);
        if (crateMesh) {
            claw.remove(crateMesh);
            crateMesh = undefined;
        }
        phases = Array(4).fill(false);
        phases[0] = true;
    }
}

function standardUpdate() {
    "use strict";
    keyUpdate();
    updateClawCamera();
    updateHUD();

    modifyTrolleyX(Math.min(trolleyX, MAX_TROLLEY_X));
    modifyTrolleyX(Math.max(trolleyX, MIN_TROLLEY_X));
    trolley.position.x = trolleyX;

    modifyTowerAngle(Math.min(towerAngle, MAX_TOWER_ANGLE));
    modifyTowerAngle(Math.max(towerAngle, MIN_TOWER_ANGLE));
    upperCrane.setRotationFromAxisAngle(Y_AXIS, towerAngle);

    modifyRopeScale(Math.min(ropeScale, MAX_ROPE_SCALE));
    modifyRopeScale(Math.max(ropeScale, MIN_ROPE_SCALE));
    let hRope = BASE_H_ROPE * ropeScale;
    let rope = trolley.getObjectByName("rope");
    rope.scale.y = ropeScale;
    rope.position.y = -(DIMENSIONS.hTrolley + hRope / 2);
    trolley.getObjectByName("clawBase").position.y = -(
        DIMENSIONS.hTrolley +
        hRope +
        DIMENSIONS.hClawBase / 2
    );

    modifyClawY(Math.min(clawY, MAX_CLAW_Y));
    modifyClawY(Math.max(clawY, MIN_CLAW_Y));
    claw.position.y = clawY;

    modifyFingerAngle(Math.min(fingerAngle, MAX_FINGER_ANGLE));
    modifyFingerAngle(Math.max(fingerAngle, MIN_FINGER_ANGLE));
    claw.children[0].setRotationFromAxisAngle(Z_AXIS, fingerAngle);
    claw.children[1].setRotationFromAxisAngle(Z_AXIS, -fingerAngle);
    claw.children[2].setRotationFromAxisAngle(X_AXIS, fingerAngle);
    claw.children[3].setRotationFromAxisAngle(X_AXIS, -fingerAngle);

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
                    for (let material in MATERIALS) {
                        MATERIALS[material].wireframe =
                            !MATERIALS[material].wireframe;
                    }
                    pressedKeys[key] = false;
                    break;
                case "q":
                    if (!isAnimating)
                        modifyTowerAngle(towerAngle + scaler * 0.1);
                    break;
                case "a":
                    if (!isAnimating)
                        modifyTowerAngle(towerAngle - scaler * 0.1);
                    break;
                case "w":
                    if (!isAnimating) modifyTrolleyX(trolleyX + scaler * 1);
                    break;
                case "s":
                    if (!isAnimating) modifyTrolleyX(trolleyX - scaler * 1);
                    break;
                case "e":
                    if (!isAnimating) {
                        modifyRopeScale(ropeScale - scaler * 0.2);
                        modifyClawY(clawY + scaler * 1);
                    }
                    break;
                case "d":
                    if (!isAnimating) {
                        modifyRopeScale(ropeScale + scaler * 0.2);
                        modifyClawY(clawY - scaler * 1);
                    }
                    break;
                case "r":
                    if (!isAnimating)
                        modifyFingerAngle(fingerAngle + scaler * 0.1);
                    break;
                case "f":
                    if (!isAnimating)
                        modifyFingerAngle(fingerAngle - scaler * 0.1);
                    break;
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
    if (MATERIALS.coffeeBrown.wireframe == true)
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

init();
animate();
