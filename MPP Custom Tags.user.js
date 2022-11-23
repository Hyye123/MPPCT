// ==UserScript==
// @name         MPP Custom Tags
// @namespace    http://tampermonkey.net/
// @version      1.1
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
    localStorage.tag = JSON.stringify({text: "None", color: "#000000"});
}
const ver = '1.1';
var tag = JSON.parse(localStorage.tag);

MPP.client.on('hi', () => {
    if (!MPP.client.customSubscribed) {
        MPP.client.sendArray([{m:"+custom"}]);
        MPP.client.customSubscribed = true;
    }
    setTimeout(function() {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
    }, 1500);
});

function updtag(text, color, _id) {
    if (document.getElementById(`nametag-${_id}`) != null) document.getElementById(`nametag-${_id}`).remove();
    var tagDiv = document.createElement("div")
    tagDiv.className = "nametag";
    tagDiv.id = `nametag-${_id}`;
    tagDiv.style = `background-color:${color};`;
    tagDiv.innerText = text;
    document.getElementById(`namediv-${_id}`).prepend(tagDiv);
    document.getElementById(`namediv-${_id}`).title = "This is a MPPCT user.";
}

var sendTagLocked = false;
function sendTag() {
    if (sendTagLocked) return;
    MPP.client.sendArray([{m: "custom", data: {m: 'mppct', tag: tag.text, color: tag.color}, target: { mode: 'subscribed' } }])
    sendTagLocked = true;
    setTimeout(function() {
        sendTagLocked = false;
    }, 750)
}
function askForTags() {
    MPP.client.sendArray([{m: "custom", data: {m: 'mppctgt'}, target: { mode: 'subscribed' } }]);
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
            if (document.getElementById(`namediv-${data.p}`) != null) {
                updtag(data.data.tag, data.data.color, data.p);
            }
        }
    }
    if (data.data.m == 'mppctgt') {
        if (MPP.client.ppl[data.p] != undefined) {
            sendTag();
        }
    }
});
MPP.client.on("p", (p) => {
    if (p._id == MPP.client.getOwnParticipant()._id) {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
    }
    sendTag();
});
MPP.client.on("ch", (p) => {
    setTimeout(function() {
        askForTags();
    }, 1250);
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
    updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
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
    if (ver != json.latest) {
        setInterval(function() {
            MPP.chat.receive({
                "m": "a",
                "t": Date.now(),
                "a": "Please update MPPCT via greasy fork(https://greasyfork.org/ru/scripts/455137-mpp-custom-tags) or github(https://github.com/Hyye123/MPPCT)",
                "p": {
                    "_id": "MPPCT",
                    "name": "MPPCT",
                    "color": "#ffffff",
                    "id": "MPPCT"
                }
            });
        }, 30000);
    }
}));
