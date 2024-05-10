import * as THREE from "three";
import {
    clawBoundingBox,
    clawFingerMixers,
    claw,
    modifyFingerAngle,
    modifyTowerAngle,
    modifyTrolleyX,
    trolley,
    trolleyMixer,
    upperCrane,
    upperCraneMixer,
} from "./crane.js";
import { crates, crateBounds } from "./crates.js";
import {
    X_AXIS,
    Y_AXIS,
    Z_AXIS,
    MAX_FINGER_ANGLE,
    MAX_TOWER_ANGLE,
    MAX_TROLLEY_X,
} from "./constants.js";
export { checkCollisions, isAnimating };

let isAnimating = false;

///////////////////////
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
    modifyFingerAngle(MAX_FINGER_ANGLE);
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
    modifyTowerAngle(MAX_TOWER_ANGLE);
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
    modifyTrolleyX(MAX_TROLLEY_X);
}
