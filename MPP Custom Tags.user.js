// ==UserScript==
// @name         MPP Custom Tags
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  MPP Custom Tags (MPPCT)
// @author       НУУЕ (!НУУЕ!#4440)
// @match        *://mppclone.com/*
// @match        *://www.multiplayerpiano.com/*
// @match        *://multiplayerpiano.com/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mppclone.com
// ==/UserScript==


console.log('Loaded MPPCT.')
if (!localStorage.tag) {
    localStorage.tag = JSON.stringify({text: "USER", color: "#000000"});
}
const ver = '1.0.6';
var tag = JSON.parse(localStorage.tag);

MPP.client.on('hi', () => {
    if (!MPP.client.customSubscribed) {
        MPP.client.sendArray([{m:"+custom"}]);
        MPP.client.customSubscribed = true;
    }
});

var bufferlocked = false;
function sendTag() {
    if (bufferlocked) return;
    MPP.client.sendArray([{m: "custom", data: {m: 'mppct', tag: tag.text, color: tag.color}, target: { mode: 'subscribed', global: false } }])
    bufferlocked = true;
    setTimeout(function() {
        bufferlocked = false;
    }, 1000)
}

function hexToRGB(hex) {
    let r = 0, g = 0, b = 0;

    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];

    var Rgb = +r + ', ' + +g + ', ' + +b;
    return Rgb;
}

MPP.client.on("custom", (data) => {
    if (data.data.m == 'mppct') {
        if (data.data.tag && data.data.color) {
            if (MPP.client.ppl[data.p] != undefined) {
                document.getElementById(`namediv-${data.p}`).innerHTML = `<div class="nametag" id="nametag-${data.p}" style="background-color: rgb(${hexToRGB(data.data.color)});">${data.data.tag}</div><div class="nametext" id="nametext-${data.p}">${MPP.client.findParticipantById(data.p).name}</div>`;
                document.getElementById(`namediv-${data.p}`).title = "This is a MPPCT user.";
            }
        }
    }
    if (data.data.m == 'mppctgt') {
        sendTag();
    }
});
MPP.client.on("p", (p) => {
    if (p._id == MPP.client.getOwnParticipant()._id) {
        document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).innerHTML = `<div class="nametag" id="nametag-${MPP.client.getOwnParticipant()._id}" style="background-color: rgb(${hexToRGB(tag.color)});">${tag.text}</div><div class="nametext" id="nametext-${MPP.client.getOwnParticipant()._id}">${MPP.client.getOwnParticipant().name}</div>`;
        document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).title = "This is a MPPCT user.";
    }
    sendTag();
});
MPP.client.on("participant added", (p) => {
    if (p._id == MPP.client.getOwnParticipant()._id) {
        document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).innerHTML = `<div class="nametag" id="nametag-${MPP.client.getOwnParticipant()._id}" style="background-color: rgb(${hexToRGB(tag.color)});">${tag.text}</div><div class="nametext" id="nametext-${MPP.client.getOwnParticipant()._id}">${MPP.client.getOwnParticipant().name}</div>`;
        document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).title = "This is a MPPCT user.";
    }
    MPP.client.sendArray([{m: "custom", data: {m: 'mppctgt'}, target: { mode: 'subscribed', global: false } }]);
});


// Buttons  //////////////////////////////////////////////////////////////////////////
const a = document.createElement("input");
a.name = "tag";
a.type = "text";
a.placeholder = "Tag";
a.maxlength = "25";
a.className = "text";
a.style = "width: 100px; height: 20px;";
document.body.getElementsByClassName("dialog").rename.appendChild(a);

const q = document.createElement("input");
q.name = "tagcolor";
q.type = "color";
q.placeholder = "";
q.maxlength = "7";
q.className = "color";
document.body.getElementsByClassName("dialog").rename.appendChild(q);

const e = document.createElement("button");
e.addEventListener("click", () => {
    localStorage.tag = JSON.stringify({text: $("#rename input[name=tag]").val(), color: $("#rename input[name=tagcolor]").val()});
    tag = JSON.parse(localStorage.tag);
    document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).innerHTML = `<div class="nametag" id="nametag-${MPP.client.getOwnParticipant()._id}" style="background-color: rgb(${hexToRGB(tag.color)});">${tag.text}</div><div class="nametext" id="nametext-${MPP.client.getOwnParticipant()._id}">${MPP.client.getOwnParticipant().name}</div>`;
    document.getElementById(`namediv-${MPP.client.getOwnParticipant()._id}`).title = "This is a MPPCT user."
    sendTag()
});
e.innerText = "SET TAG";
e.className = "submittag";
e.style.position = "fixed";
document.body.getElementsByClassName("dialog").rename.appendChild(e);

$("#rename input[name=tag]").val(tag.text);
$("#rename input[name=tagcolor]").val(tag.color);


//Version checker ////////////////////////////////
fetch('https://raw.githubusercontent.com/Hyye123/MPPCT/main/version.json').then(r => r.json().then(json => {
    if (ver != json.latest) setInterval(function() {
        MPP.chat.receive({
            "m": "a",
            "t": Date.now(),
            "a": "Please update MPPCT via github(https://github.com/Hyye123/MPPCT) or greasy fork(https://greasyfork.org/ru/scripts/455137-mpp-custom-tags)",
            "p": {
                "_id": "MPPCT",
                "name": "MPPCT",
                "color": "#ffffff",
                "id": "MPPCT"
            }
        });
    }, 30000);
}));
