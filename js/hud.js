import { BIND_INFORMATION } from "./constants.js";
export { createHud };

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
