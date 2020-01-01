const CharacterImporter = require("./characterImporter");

let CharacterController = function () {
    this.characterImporter = new CharacterImporter();
};

CharacterController.prototype.setupEndpoints = function (server) {
    createCharacterEndpoints(this, server);
};

function createCharacterEndpoints(instance, server) {
    prepareCharacterFromWikiPage(instance, server);
    prepareCharacterConfirmAction(instance, server);
}

function prepareCharacterFromWikiPage(instance, server) {
    server.post("/newCharacter", (req, res) => {
        instance.characterImporter.provideCharacterBaseInfoFromPageAsync(req.body["characterUrl"]).then((response) => {
            res.end(JSON.stringify({
                CharacterId: response.getId(),
                Url: req.body["characterUrl"],
                OriginAlias: response.getCurrentAlias(),
                SetAlias: req.body["customAlias"].trim() === "" ? response.getCurrentAlias().trim() : req.body["customAlias"],
                Universe: response.getUniverse(),
                RealName: response.getRealName(),
                AppearanceCount: response.getAppearancesCount(),
                MinorAppearanceCount: response.getMinorAppearancesCount(),
                AppearanceUrl: response.getAppearancesUrl(),
                MinorAppearanceUrl: response.getMinorAppearancesUrl(),
                ImageUrl: response.getImage()
            }));
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on decoding character from provided page");
        });
    });
}

function prepareCharacterConfirmAction(instance, server) {
    server.post("/confirmCharacter", (req, res) => {
        instance.characterImporter.downloadAndStoreConfirmedCharacterAsync(req.body["currentCharacterInfo"]).then(() => {
            res.end();
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on saving character and its appearances");
        });
    });
}

module.exports = CharacterController;