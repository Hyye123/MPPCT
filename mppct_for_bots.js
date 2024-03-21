let tag = { text: "None", color: "#000000" };

//gradient example: tag.gradient = 'linear-gradient(red, blue)';

client.on('hi', () => {
    client.sendArray([{ m: "+custom" }]);
});

function sendTag() {
    client.sendArray([{ m: "custom", data: { m: 'mppct', text: tag.text, color: tag.color, gradient: tag.gradient }, target: { mode: 'subscribed' } }])
}

client.on("custom", (data) => {
    if (data.data.m == 'mppctreq') {
        if (client.ppl[data.p]) {
            client.sendArray([{ m: "custom", data: { m: 'mppct', text: tag.text, color: tag.color, gradient: tag.gradient }, target: { mode: 'id', id: data.p } }]);
        }
    }
});
client.on("p", (p) => {
    if (p._id == client.getOwnParticipant()._id) {
        sendTag();
    }
});
client.on("c", (p) => {
    sendTag();
});