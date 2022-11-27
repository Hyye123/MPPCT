var tag = {text: "None", color: "#000000"};

client.on('hi', () => {
    if (!client.customSubscribed) {
        client.sendArray([{m:"+custom"}]);
        client.customSubscribed = true;
    }
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
function askForTags() {
    client.sendArray([{m: "custom", data: {m: 'mppctgt'}, target: { mode: 'subscribed' } }]);
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
    setTimeout(function() {
        askForTags();
    }, 1250);
});
