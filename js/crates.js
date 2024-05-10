import * as THREE from "three";
import { MATERIALS } from "./constants.js";
import { scene } from "./main-script.js";
export { createContainer, createCrates, crateBounds, crates };

let geometry, mesh;

let crates = [],
    container;

let crateBounds = [];

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCrates() {
    "use strict";
    crates.push(new THREE.Object3D());
    let pos = new THREE.Vector3(20, 0, -10);
    let dim = new THREE.Vector3(5, 5, 5);
    let rot = 1;
    addCrate(crates[0], pos, dim, rot, MATERIALS.coffeeBrown);

    crates.push(new THREE.Object3D());
    pos = new THREE.Vector3(10, 0, -20);
    dim = new THREE.Vector3(5, 5, 5);
    rot = 0;
    addCrate(crates[1], pos, dim, rot, MATERIALS.red);

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
    let lContainer = 15;
    let hContainer = 5;
    let cContainer = 20;
    let thickness = 1;
    let posX = -18;
    let posZ = 0;

    // X Walls
    let pos = new THREE.Vector3(0, 0, -cContainer/2);
    let dim = new THREE.Vector3(lContainer, hContainer, thickness);
    let rot = 0;
    addWall(container, pos, dim, rot, MATERIALS.coffeeBrown);

    pos = new THREE.Vector3(0, 0, cContainer/2);
    dim = new THREE.Vector3(lContainer, hContainer, thickness);
    rot = 0;
    addWall(container, pos, dim, rot, MATERIALS.coffeeBrown);

    // Z Walls
    pos = new THREE.Vector3(-0.5+lContainer/2, 0, 0);
    dim = new THREE.Vector3(cContainer, hContainer, thickness);
    rot = Math.PI / 2;
    addWall(container, pos, dim, rot, MATERIALS.coffeeBrown);

    pos = new THREE.Vector3(0.5-lContainer/2, 0, 0);
    dim = new THREE.Vector3(cContainer, hContainer, thickness);
    rot = Math.PI / 2;
    addWall(container, pos, dim, rot, MATERIALS.coffeeBrown);

    // Floor
    pos = new THREE.Vector3(0, 0, 0);
    dim = new THREE.Vector3(lContainer - 1, thickness, cContainer);
    rot = 0;
    addWall(container, pos, dim, rot, MATERIALS.grey);

    container.position.set(posX, 0, posZ);
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
