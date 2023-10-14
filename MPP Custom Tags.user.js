// ==UserScript==
// @name         MPP Custom Tags
// @namespace    http://tampermonkey.net/
// @version      1.8.8
// @description  MPP Custom Tags (MPPCT)
// @author       НУУЕ (!НУУЕ2004#4440)
// @match        *://mppclone.com/*
// @match        *://www.multiplayerpiano.net/*
// @match        *://www.multiplayerpiano.org/*
// @match        *://multiplayerpiano.com/*
// @match        *://better.mppclone.me/*
// @match        *://mppclone.com/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mppclone.com
// ==/UserScript==

console.log('%cLoaded MPPCT! uwu','color:orange; font-size:15px;');
if (!localStorage.tag) {
    localStorage.tag = JSON.stringify({text: 'None', color: '#000000'});
}
if (!localStorage.knownTags) {
    localStorage.knownTags = '{}';
}
const Debug = false;
const ver = '1.8.7';
let tag = JSON.parse(localStorage.tag),
    knownTags = JSON.parse(localStorage.knownTags);

MPP.client.on('hi', () => {
    MPP.client.sendArray([{m: '+custom'}]);
    setTimeout(function() { //whyyyyyyyyyyyyyyyy
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id, tag.gradient);
        askForTags();
    }, 1500);
});

const allowedGradients = ['linear-gradient', 'radial-gradient', 'repeating-radial-gradient', 'conic-gradient', 'repeating-conic-gradient'];

function updtag(text, color, _id, gradient) {
    if (text.length > 50) {
        if (Debug) console.log('Failed to update tag. Reason: text too long. _ID: ' + _id);
        return;
    }
    if (!document.getElementById(`namediv-${_id}`)) return;
    if (document.getElementById(`nametag-${_id}`) != null) {
        document.getElementById(`nametag-${_id}`).remove();
    } else if (Debug) console.log('New tag. _ID: ' + _id);
    knownTags[_id] = {text: text, color: color};
    localStorage.knownTags = JSON.stringify(knownTags);
    let tagDiv = document.createElement('div')
    tagDiv.className = 'nametag';
    tagDiv.id = `nametag-${_id}`;
    tagDiv.style['background-color'] = color;
    if (gradient) {
        if (!gradient.includes('"') && !gradient.includes(';') && !gradient.includes(':') && (gradient.split('(').length === 2 && gradient.split(')').length === 2)) {
            let gradientAllowed = false;
            allowedGradients.forEach((Gradient) => {
                if (gradient.startsWith(Gradient)) {
                    if (gradientAllowed) return;
                    else gradientAllowed = true;
                    tagDiv.style.background = gradient;
                    knownTags[_id].gradient = gradient;
                    localStorage.knownTags = JSON.stringify(knownTags);
                }
            });
        }
    }
    tagDiv.innerText = text; // xss fix
    document.getElementById(`namediv-${_id}`).prepend(tagDiv);
    document.getElementById(`namediv-${_id}`).title = 'This is an MPPCT user.';
}


let sendTagLocked = false; // do NOT ask why i added it.
function sendTag(id) {
    if (sendTagLocked && !id) {
        if (Debug) return console.log('Called function sendTag(), but its locked');
        else return;
    };
    if (id) MPP.client.sendArray([{m: "custom", data: {m: "mppct", text: tag.text, color: tag.color, gradient: tag.gradient}, target: { mode: "id", id: id } }]);
    else MPP.client.sendArray([{m: "custom", data: {m: "mppct", text: tag.text, color: tag.color, gradient: tag.gradient}, target: { mode: "subscribed" } }]);
    if (Debug) console.log('Called function sendTag(), tag successfully sent');
    sendTagLocked = true;
    setTimeout(function() {
        sendTagLocked = false;
    }, 750)
}
function askForTags() {
    MPP.client.sendArray([{m: "custom", data: {m: "mppctreq"}, target: { mode: "subscribed" } }]);
}

MPP.client.on('custom', (data) => {
    if (data.data.m == 'mppct') {
        if (data.data.text && (data.data.color || data.data.gradient)) {
            if (MPP.client.ppl[data.p]) {
                updtag(data.data.text || 'None', data.data.color || '#000000', data.p, data.data.gradient);
                if (Debug) console.log(`Received tag and its successfully confirmed. _ID: ${data.p}, text: ${data.data.text}, color: ${data.data.color || 'None'}, gradient: ${data.data.gradient || 'None'}`);
            } else if (Debug) console.warn('Received tag, but its failed to confirm. Reason: not found _id in ppl');
        } else if (Debug) console.warn('Received tag, but its failed to confirm. Reason: missing data.text or data.color');
    }
    if (data.data.m == 'mppctreq') {
        if (MPP.client.ppl[data.p] != undefined) {
            sendTag(data.p);
            if (Debug) console.log('Received tags request and its succesfully confirmed. _ID: ' + data.p);
        } else if (Debug) console.warn('Received tags request, but its failed to confirm. Reason: not found _id in ppl. Sender _ID: ' + data.p);
    }
});
MPP.client.on('p', (p) => {
    if (p._id == MPP.client.getOwnParticipant()._id) {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id, tag.gradient);
        if (Debug) console.log('Got own player update, tag updated');
        sendTag();
    }
});
MPP.client.on('ch', (p) => {
    if (!p.hasOwnProperty('p')) return;
    askForTags();
    sendTag();
    if (Debug) console.log('Received ch event and sent tags request');
});

// Tags in chat
MPP.client.on('a', (msg) => {
    if (!knownTags[msg.p._id]) return;
    let aTag;
    if (msg.p._id == MPP.client.getOwnParticipant()._id) aTag = tag;
    else aTag = knownTags[msg.p._id];

    if (document.getElementById(`nametext-${msg.p._id}`)) {
        if (document.getElementById(`nametag-${msg.p._id}`).innerText != knownTags[msg.p._id].text) {
            delete knownTags[msg.p._id];
            localStorage.knownTags = JSON.stringify(knownTags);
            return;
        }
    }

    let chatMessage = $('.message').last()[0];
    let Span = document.createElement('span'); // <span style="background-color: ${aTag.color};color:#ffffff;" class="nametag">${aTag.text}</span>
    Span.style['background-color'] = aTag.color;
    if (knownTags[msg.p._id]) Span.style.background = aTag.gradient;
    Span.style.color = '#ffffff';
    Span.className = 'nametag';
    Span.innerText = aTag.text;
    chatMessage.appendChild(Span);
});

MPP.client.on('c', (msg) => { //idk maybe it is working now
    if (!msg.c) return;
    if (!Array.isArray(msg.c)) return;
    msg.c.forEach((a, i) => {
        if (a.m == 'dm') return;
        let p = a.p;
        if (!knownTags[p._id]) return;
        let aTag;
        if (p._id == MPP.client.getOwnParticipant()._id) aTag = tag;
        else aTag = knownTags[p._id];

        setTimeout(function() {
            if (document.getElementById(`nametext-${p._id}`)) { // xd
                if (p._id != MPP.client.getOwnParticipant()._id) {
                    if (document.getElementById(`nametag-${p._id}`).innerText != aTag.text) {
                        delete knownTags[p._id];
                        localStorage.knownTags = JSON.stringify(knownTags);
                        return;
                    }
                }
            }
        }, 2000);

        let chatMessage = $('.message')[i];
        let Span = document.createElement('span'); // <span style="background-color: ${aTag.color};color:#ffffff;" class="nametag">${aTag.text}</span>
        Span.style['background-color'] = aTag.color;
        if (knownTags[p._id]) Span.style.background = aTag.gradient;
        Span.style.color = '#ffffff';
        Span.className = 'nametag';
        Span.innerText = aTag.text;
        chatMessage.appendChild(Span);
    });
});


// Buttons
const a = document.createElement('input');
a.name = 'tag';
a.type = 'text';
a.placeholder = 'Tag';
a.maxLength = '50';
a.className = 'text';
a.style = 'width: 100px; height: 20px;';
document.body.getElementsByClassName('dialog').rename.appendChild(a);

const q = document.createElement('input');
q.name = 'tagcolor';
q.type = 'color';
q.placeholder = '';
q.maxlength = '7';
q.className = 'color';
document.body.getElementsByClassName('dialog').rename.appendChild(q);

const e = document.createElement('button');
e.addEventListener('click', () => {
    if ($('#rename input[name=tag]').val() == '') return;
    let newTag = JSON.parse(localStorage.tag);
    newTag.text = $('#rename input[name=tag]').val() || 'None';
    newTag.color = $('#rename input[name=tagcolor]').val() || '#000000';
    localStorage.tag = JSON.stringify(newTag);
    tag = newTag;
    updtag(newTag.text, newTag.color, MPP.client.getOwnParticipant()._id, newTag.gradient);
    sendTag();
    if (Debug) console.log('Updated own tag');
});
e.innerText = 'SET TAG';
e.className = 'top-button';
e.style.position = 'fixed';
e.style.height = '30px';
document.body.getElementsByClassName('dialog').rename.appendChild(e);

$('#rename input[name=tag]').val(tag.text);
$('#rename input[name=tagcolor]').val(tag.color);


//Version checker
function checkVersion() {
    fetch('https://raw.githubusercontent.com/Hyye123/MPPCT/main/version.json').then(r => r.json().then(json => {
        if (ver != json.latest) {
            setInterval(function() {
                MPP.chat.receive({
                    "m": "a",
                    "t": Date.now(),
                    "a": "Please update MPPCT via greasy fork( https://greasyfork.org/ru/scripts/455137-mpp-custom-tags ) or github( https://github.com/Hyye123/MPPCT )",
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
                    "a": "Пожалуйста обновите MPPCT через greasy fork( https://greasyfork.org/ru/scripts/455137-mpp-custom-tags ) или github( https://github.com/Hyye123/MPPCT )",
                    "p": {
                        "_id": "MPPCT",
                        "name": "MPPCT (rus)",
                        "color": "#ffffff",
                        "id": "MPPCT"
                    }
                });
            }, 30000);
        } else {
            console.log('Version of MPPCT checked. This version is the latest.');
        }
    }));
}
setInterval(checkVersion, 300000);
setTimeout(checkVersion, 5000);
