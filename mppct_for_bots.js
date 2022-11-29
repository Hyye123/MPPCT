var tag = {text: "None", color: "#000000"};

client.on('hi', () => {
    if (!client.customSubscribed) {
        client.sendArray([{m:"+custom"}]);
        client.customSubscribed = true;
    }
    sendTag();
});

var sendTagLocked = false;
function sendTag() {
    if (sendTagLocked) return;
    client.sendArray([{m: "custom", data: {m: 'mppct', text: tag.text, color: tag.color}, target: { mode: 'subscribed' } }])
    sendTagLocked = true;
    setTimeout(function() {
        sendTagLocked = false;
    }, 750)
}

client.on("custom", (data) => {
    if (data.data.m == 'mppctreq') {
        if (client.ppl[data.p] != undefined) {
            client.sendArray([{m: "custom", data: {m: 'mppct', text: tag.text, color: tag.color}, target: { mode: 'id', id: data.p } }]);
        }
    }
});
client.on("p", (p) => {
    if (p._id == client.getOwnParticipant()._id) {
        sendTag();
    }
});
client.on("ch", (p) => {
    sendTag();
});
