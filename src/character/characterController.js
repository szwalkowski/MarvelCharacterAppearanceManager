const CharacterImporter = require("./characterImporter");

let CharacterController = function () {
    this.characterImporter = new CharacterImporter();
};

CharacterController.prototype.setupEndpoints = function (server) {
    createCharacterEndpoints(this, server);
};

function createCharacterEndpoints(instance, server) {
    server.post("/newCharacter", (req, res) => {
        instance.characterImporter.provideCharacterBaseInfoFromPage(req.body["characterUrl"]).then((response) => {
            console.log(response);
            res.end(); //TODO: if error happens then request is pending
        });
    });
}

module.exports = CharacterController;