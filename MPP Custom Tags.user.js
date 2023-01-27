// ==UserScript==
// @name         MPP Custom Tags
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  MPP Custom Tags (MPPCT)
// @author       НУУЕ (!НУУЕ!#4440)
// @match        *://mppclone.com/*
// @match        *://www.multiplayerpiano.com/*
// @match        *://multiplayerpiano.com/*
// @match        *://better.mppclone.me/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mppclone.com
// ==/UserScript==


console.log('Loaded MPPCT.')
if (!localStorage.tag) {
    localStorage.tag = JSON.stringify({text: "Tag", color: "#000000"});
}
if (!localStorage.knownTags) {
    localStorage.knownTags = '{}';
}
const debug = false;
const ver = '1.5';
let tag = JSON.parse(localStorage.tag);
let knownTags = JSON.parse(localStorage.knownTags);

MPP.client.on('hi', () => {
    MPP.client.sendArray([{m: "+custom"}]);
    if (!MPP.client.customSubscribed) {
        MPP.client.customSubscribed = true;
    }
    setTimeout(function() {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
    }, 1500);
});

function updtag(text, color, _id) {
    if (text.length > 50) if (debug) return console.log("Failed to update tag. Reason: text too long. _ID: " + _id);
    if (!document.getElementById(`namediv-${_id}`)) return;
    if (document.getElementById(`nametag-${_id}`) != null) {
        document.getElementById(`nametag-${_id}`).remove();
    } else if (debug) console.log("New tag. _ID: " + _id);
    knownTags[_id] = {text: text, color: color};
    localStorage.knownTags = JSON.stringify(knownTags);
    let tagDiv = document.createElement("div")
    tagDiv.className = "nametag";
    tagDiv.id = `nametag-${_id}`;
    tagDiv.style = `background-color:${color};`;
    tagDiv.innerText = text;
    document.getElementById(`namediv-${_id}`).prepend(tagDiv);
    document.getElementById(`namediv-${_id}`).title = "This is a MPPCT user.";
}

let sendTagLocked = false;
function sendTag() {
    if (sendTagLocked) {
        if (debug) return console.log("Called function sendTag(), but its locked");
        else return;
    };
    MPP.client.sendArray([{m: "custom", data: {m: 'mppct', text: tag.text, color: tag.color}, target: { mode: 'subscribed' } }]);
    if (debug) console.log("Called function sendTag(), tag successfully sent");
    sendTagLocked = true;
    setTimeout(function() {
        sendTagLocked = false;
    }, 750)
}
function askForTags() {
    MPP.client.sendArray([{m: "custom", data: {m: 'mppctreq'}, target: { mode: 'subscribed' } }]);
}

MPP.client.on("custom", (data) => {
    if (data.data.m == 'mppct') {
        if (data.data.text && data.data.color) {
            if (MPP.client.ppl[data.p]) {
                updtag(data.data.text, data.data.color, data.p);
                if (debug) console.log(`Received tag and its successfully confirmed. _ID: ${data.p}, text: ${data.data.text}, color: ${data.data.color}`);
            } else if (debug) console.warn("Received tag, but its failed to confirm. Reason: not found _id in ppl");
        } else if (debug) console.warn("Received tag, but its failed to confirm. Reason: missing data.text or data.color");
    }
    if (data.data.m == 'mppctreq') {
        if (MPP.client.ppl[data.p] != undefined) {
            MPP.client.sendArray([{m: "custom", data: {m: 'mppct', text: tag.text, color: tag.color}, target: { mode: 'id', id: data.p } }]);
            if (debug) console.log("Received tags request and its succesfully confirmed. _ID: " + data.p);
        } else if (debug) console.warn("Received tags request, but its failed to confirm. Reason: not found _id in ppl. Sender _ID: " + data.p);
    }
});
MPP.client.on("p", (p) => {
    if (p._id == MPP.client.getOwnParticipant()._id) {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
        if (debug) console.log("Got own player update, tag updated");
        sendTag();
    }
});
MPP.client.on("ch", (p) => {
    setTimeout(function() {
        askForTags();
        sendTag();
        if (debug) console.log("Received ch event and sent tags request");
    }, 1250);
});

// Tags in chat
MPP.client.on("a", (msg) => {
    if (!knownTags[msg.p._id]) return;
    let aTag;
    if (msg.p._id == MPP.client.getOwnParticipant()._id) aTag = tag;
    else aTag = knownTags[msg.p._id];

    if (document.getElementById(`nametext-${msg.p._id}`) != null) {
        if (document.getElementById(`nametag-${msg.p._id}`) == null) {
            delete knownTags[msg.p._id];
            localStorage.knownTags = JSON.stringify(knownTags);
            return;
        }
    }

    let span = `<span style="background-color: ${aTag.color};color:#ffffff;" class="nametag"></span>`;
    let chatMessage = $('#chat ul li').last();
    $(chatMessage).children('.name').before(span);
    $(chatMessage).children()[2].innerText = aTag.text;
});

MPP.client.on("c", (msg) => {
    if (!msg.c) return;
    if (!Array.isArray(msg.c)) return;
    msg.c.map((a, i) => {
        if (!knownTags[msg.c[i].p._id]) return;
        let aTag;
        if (msg.c[i].p._id == MPP.client.getOwnParticipant()._id) aTag = tag;
        else aTag = knownTags[msg.c[i].p._id];

        if (document.getElementById(`nametext-${msg.c[i].p._id}`) != null) {
            if (document.getElementById(`nametag-${msg.c[i].p._id}`) == null) {
                delete knownTags[msg.c[i].p._id];
                localStorage.knownTags = JSON.stringify(knownTags);
                return;
            }
        }

        let span = `<span style="background-color: ${aTag.color};color:#ffffff;" class="nametag"></span>`;
        let chatMessage = $(`#chat ul li`)[i];
        $(chatMessage).children('.name').before(span);
        $(chatMessage).children()[2].innerText = aTag.text;
    });
});


// Buttons
const a = document.createElement("input");
a.name = "tag";
a.type = "text";
a.placeholder = "Tag";
a.maxLength = "50";
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
    if ($("#rename input[name=tag]").val() == '') return;
    localStorage.tag = JSON.stringify({text: $("#rename input[name=tag]").val(), color: $("#rename input[name=tagcolor]").val()});
    tag = JSON.parse(localStorage.tag);
    updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id);
    sendTag()
    if (debug) console.log("Updated own tag");
});
e.innerText = "SET TAG";
e.className = "top-button";
e.style.position = "fixed";
e.style.height = "30px";
document.body.getElementsByClassName("dialog").rename.appendChild(e);

$("#rename input[name=tag]").val(tag.text);
$("#rename input[name=tagcolor]").val(tag.color);


//Version checker
setInterval(function() {
    fetch('https://raw.githubusercontent.com/Hyye123/MPPCT/main/version.json').then(r => r.json().then(json => {
        if (ver != json.latest) {
            setInterval(function() {
                MPP.chat.receive({
                    "m": "a",
                    "t": Date.now(),
                    "a": "Please update MPPCT via greasy fork(https://greasyfork.org/ru/scripts/455137-mpp-custom-tags) or github(https://github.com/Hyye123/MPPCT)",
                    "p": {
                        "_id": "MPPCT",
                        "name": "MPPCT (eng)",
                        "color": "#ffffff",
                        "id": "MPPCT"
                    }
                });
                MPP.chat.receive({
                    "m": "a",
                    "t": Date.now(),
                    "a": "Пожалуйста обновите MPPCT через greasy fork(https://greasyfork.org/ru/scripts/455137-mpp-custom-tags) или github(https://github.com/Hyye123/MPPCT)",
                    "p": {
                        "_id": "MPPCT",
                        "name": "MPPCT (ru)",
                        "color": "#ffffff",
                        "id": "MPPCT"
                    }
                });
            }, 30000);
        } else {
            if (debug) console.log("Version of MPPCT checked. This version is the latest.");
        }
    }));
}, 300000);
