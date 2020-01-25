const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionaryManager = require("../dictionaries/dictionariesManager");
const DictionaryTranslator = require("../dictionaries/dictionaryTranslator");

let CharacterController = function () {
    this.characterImporter = new CharacterImporter();
    this.characterManager = new CharacterManager();
    this.dictionaryManager = new DictionaryManager();
    this.dictionaryTranslator = new DictionaryTranslator();
};

CharacterController.prototype.setupEndpoints = function (server) {
    createCharacterEndpoints(this, server);
};

function createCharacterEndpoints(instance, server) {
    prepareCharacterFromWikiPage(instance, server);
    prepareCharacterConfirmAction(instance, server);
    prepareGetAllCharactersAliases(instance, server);
    prepareGetAllIssuesForCharacter(instance, server);
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
        instance.characterImporter.downloadAndStoreConfirmedCharacterAsync(req.body).then(() => {
            res.end();
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on saving character and its appearances");
        });
    });
}

function prepareGetAllCharactersAliases(instance, server) {
    server.get("/getAllCharacters", (req, res) => {
        res.end(JSON.stringify(instance.characterManager.provideAllCharactersAvailable()));
    });
}

function prepareGetAllIssuesForCharacter(instance, server) {
    server.get("/getAllIssuesForCharacter", (req, res) => {
        const data = instance.characterManager.loadIssuesAndAppearances(req.query.alias, req.query.universe);
        const dictionary = instance.dictionaryManager.getDictionaryById("appearanceType");
        data.setOfAppearanceTypes = instance.dictionaryTranslator.translateArrayUsingDictionary(data.setOfAppearanceTypes, dictionary, true);
        data.characterData.issues.forEach(issue => {
            issue.appearances.forEach(appearance => {
                appearance.appearanceTypes = instance.dictionaryTranslator.translateArrayUsingDictionary(appearance.appearanceTypes, dictionary, true);
            });
        });
        res.end(JSON.stringify(data));
    });
}

module.exports = CharacterController;