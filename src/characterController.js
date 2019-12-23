function createCharacterEndpoints(server) {
    server.post("/newCharacter", (req, res) => {
        console.log(req.body);
    });
}

module.exports = {
    createCharacterEndpoints: createCharacterEndpoints
};