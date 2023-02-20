// ==UserScript==
// @name         MPP Custom Tags
// @namespace    http://tampermonkey.net/
// @version      1.7.5
// @description  MPP Custom Tags (MPPCT)
// @author       НУУЕ (!НУУЕ!#4440)
// @match        *://mppclone.com/*
// @match        *://www.multiplayerpiano.com/*
// @match        *://multiplayerpiano.com/*
// @match        *://better.mppclone.me/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mppclone.com
// ==/UserScript==

window.addEventListener('load', () => {
    console.log('%cLoaded MPPCT! uwu','color:orange; font-size:15px;');
    if (!localStorage.tag) {
        localStorage.tag = JSON.stringify({text: 'Tag', color: '#000000'});
    }
    if (!localStorage.knownTags) {
        localStorage.knownTags = '{}';
    }
    const debug = false;
    const ver = '1.7.5';
    let tag = JSON.parse(localStorage.tag);
    let knownTags = JSON.parse(localStorage.knownTags);

    MPP.client.on('hi', () => {
        MPP.client.sendArray([{m: '+custom'}]);
    });

    setTimeout(function() {
        updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id, tag.gradient);
    }, 1500);

    const allowedGradients = ['linear-gradient', 'radial-gradient', 'repeating-radial-gradient', 'conic-gradient', 'repeating-conic-gradient'];

    function updtag(text, color, _id, gradient) {
        if (text.length > 50) if (debug) return console.log('Failed to update tag. Reason: text too long. _ID: ' + _id);
        if (!document.getElementById(`namediv-${_id}`)) return;
        if (document.getElementById(`nametag-${_id}`) != null) {
            document.getElementById(`nametag-${_id}`).remove();
        } else if (debug) console.log('New tag. _ID: ' + _id);
        knownTags[_id] = {text: text, color: color};
        localStorage.knownTags = JSON.stringify(knownTags);
        let tagDiv = document.createElement('div')
        tagDiv.className = 'nametag';
        tagDiv.id = `nametag-${_id}`;
        tagDiv.style['background-color'] = color;
        if (gradient) {
            if (!gradient.includes(':') && (gradient.split('(').length === 2 && gradient.split(')').length === 2)) {
                let gradientAllowed = false;
                allowedGradients.forEach((v) => {
                    if (gradient.startsWith(v)) {
                        if (gradientAllowed) return;
                        else gradientAllowed = true;
                        tagDiv.style.background = gradient;
                        knownTags[_id].gradient = gradient;
                        localStorage.knownTags = JSON.stringify(knownTags);
                    }
                });
            }
        }
        tagDiv.innerText = text;
        document.getElementById(`namediv-${_id}`).prepend(tagDiv);
        document.getElementById(`namediv-${_id}`).title = 'This is an MPPCT user.';
    }

    let sendTagLocked = false;
    function sendTag(id) {
        if (sendTagLocked && !id) {
            if (debug) return console.log('Called function sendTag(), but its locked');
            else return;
        };
        setTimeout(function() {
            if (id) MPP.client.sendArray([{m: "custom", data: {m: "mppct", text: tag.text, color: tag.color, gradient: tag.gradient}, target: { mode: "id", id: id } }]);
            else MPP.client.sendArray([{m: "custom", data: {m: "mppct", text: tag.text, color: tag.color, gradient: tag.gradient}, target: { mode: "subscribed" } }]);
        }, 500);
        if (debug) console.log('Called function sendTag(), tag successfully sent');
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
                    updtag(data.data.text, data.data.color, data.p, data.gradient);
                    if (debug) console.log(`Received tag and its successfully confirmed. _ID: ${data.p}, text: ${data.data.text}, color: ${data.data.color || 'None'}, gradient: ${data.data.gradient || 'None'}`);
                } else if (debug) console.warn('Received tag, but its failed to confirm. Reason: not found _id in ppl');
            } else if (debug) console.warn('Received tag, but its failed to confirm. Reason: missing data.text or data.color');
        }
        if (data.data.m == 'mppctreq') {
            if (MPP.client.ppl[data.p] != undefined) {
                sendTag(data.p);
                if (debug) console.log('Received tags request and its succesfully confirmed. _ID: ' + data.p);
            } else if (debug) console.warn('Received tags request, but its failed to confirm. Reason: not found _id in ppl. Sender _ID: ' + data.p);
        }
    });
    MPP.client.on('p', (p) => {
        if (p._id == MPP.client.getOwnParticipant()._id) {
            updtag(tag.text, tag.color, MPP.client.getOwnParticipant()._id, tag.gradient);
            if (debug) console.log('Got own player update, tag updated');
            sendTag();
        }
    });
    MPP.client.on('ch', (p) => {
        setTimeout(function() {
            askForTags();
            sendTag();
            if (debug) console.log('Received ch event and sent tags request');
        }, 1250);
    });

    // Tags in chat
    MPP.client.on('a', (msg) => {
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

        let chatMessage = $('.message').last()[0];
        if (chatMessage.innerText != msg.a) { //idk what is it
            if ($('.message').last().prevObject[$('.message').last().prevObject.length-2].innerText == msg.a) chatMessage = $('.message').last().prevObject[$('.message').last().prevObject.length-2]
            else if ($('.message').last().prevObject[$('.message').last().prevObject.length-1].innerText == msg.a) chatMessage = $('.message').last().prevObject[$('.message').last().prevObject.length-1]
            else if (debug) return console.log('MPPCT: Unknown error with tags in chat.');
        }
        let Span = document.createElement('span'); // <span style="background-color: ${aTag.color};color:#ffffff;" class="nametag">${aTag.text}</span>
        Span.style['background-color'] = aTag.color;
        if (knownTags[msg.p._id]) Span.style.background = aTag.gradient;
        Span.style.color = '#ffffff';
        Span.className = 'nametag';
        Span.innerText = aTag.text;
        chatMessage.appendChild(Span);
    });

    MPP.client.on('c', (msg) => {
        if (!msg.c) return;
        if (!Array.isArray(msg.c)) return;
        msg.c.map((a, i) => {
            if (a.m == 'dm') return;
            let p = a.p;
            if (!knownTags[p._id]) return;
            let aTag;
            if (p._id == MPP.client.getOwnParticipant()._id) aTag = tag;
            else aTag = knownTags[p._id];

            if (document.getElementById(`nametext-${p._id}`) != null) { // xd
                if (p._id != MPP.client.getOwnParticipant()._id) {
                    if (document.getElementById(`nametag-${p._id}`) == null) {
                        delete knownTags[p._id];
                        localStorage.knownTags = JSON.stringify(knownTags);
                        return;
                    }
                }
            }

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
        newTag.text = $('#rename input[name=tag]').val();
        newTag.color = $('#rename input[name=tagcolor]').val();
        localStorage.tag = JSON.stringify(newTag);
        tag = newTag;
        updtag(newTag.text, newTag.color, MPP.client.getOwnParticipant()._id, newTag.gradient);
        sendTag()
        if (debug) console.log('Updated own tag');
    });
    e.innerText = 'SET TAG';
    e.className = 'top-button';
    e.style.position = 'fixed';
    e.style.height = '30px';
    document.body.getElementsByClassName('dialog').rename.appendChild(e);

    $('#rename input[name=tag]').val(tag.text);
    $('#rename input[name=tagcolor]').val(tag.color);


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
                            "name": "MPPCT (rus)",
                            "color": "#ffffff",
                            "id": "MPPCT"
                        }
                    });
                }, 30000);
            } else {
                if (debug) console.log('Version of MPPCT checked. This version is the latest.');
            }
        }));
    }, 300000);
});
