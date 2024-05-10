import * as THREE from "three";
import { claw } from "./crane.js";
import { crates } from "./crates.js";
import { DIMENSIONS } from "./constants.js";
export { checkCollisions, isAnimating, updateIsAnimating, colidedCrate, updateColidedCrate };

let isAnimating = false;
let colidedCrate;

function updateColidedCrate(crate) {
    colidedCrate = crate;
}

function updateIsAnimating(animating) {
    isAnimating = animating;
}

///////////////////////
/* CHECK COLLISIONS */
//////////////////////
function coliding(a, target) {
    const boundingBoxA = new THREE.Box3();
    boundingBoxA.setFromObject(a, true);
    const boundingSphereA = new THREE.Sphere();
    boundingBoxA.getBoundingSphere(boundingSphereA);

    const boundingBoxB = new THREE.Box3();
    boundingBoxB.setFromObject(target, true);
    const boundingSphereB = new THREE.Sphere();
    boundingBoxB.getBoundingSphere(boundingSphereB);

    const rA = boundingSphereA.radius;
    const rB = boundingSphereB.radius;

    target.height = rB;

    const [cAx, cAy, cAz] = boundingSphereA.center.toArray();
    const [cBx, cBy, cBz] = boundingSphereB.center.toArray();

    return (rA + rB) ** 2 >= ((cAx - cBx) ** 2) + ((cAy - cBy) ** 2) + ((cAz - cBz) ** 2);
}

function checkCollisions() {
    "use strict";
    for (let i = 0; i < crates.length; i++) {
        if (coliding(claw, crates[i])) {
            handleCollisions(i);
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(i) {
    "use strict";
    isAnimating = true;
    colidedCrate = i;
}
