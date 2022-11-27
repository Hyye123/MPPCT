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
    client.sendArray([{m: "custom", data: {m: 'mppct', tag: tag.text, color: tag.color}, target: { mode: 'subscribed' } }])
    sendTagLocked = true;
    setTimeout(function() {
        sendTagLocked = false;
    }, 750)
}

client.on("custom", (data) => {
    if (data.data.m == 'mppctgt') {
        if (client.ppl[data.p] != undefined) {
            sendTag();
        }
    }
});
client.on("p", (p) => {
    sendTag();
});
client.on("ch", (p) => {
    sendTag();
});
