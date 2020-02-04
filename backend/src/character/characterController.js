const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionaryManager = require("../dictionaries/dictionariesManager");
const DictionaryTranslator = require("../dictionaries/dictionaryTranslator");

module.exports = class {
  #characterManager = new CharacterManager();
  #characterImporter = new CharacterImporter();
  #dictionaryManager = new DictionaryManager();
  #dictionaryTranslator = new DictionaryTranslator();

  constructor(server) {
    this.#createCharacterEndpoints(server);
  };

  #createCharacterEndpoints = function (server) {
    this.#prepareCharacterFromWikiPage(server);
    this.#prepareCharacterConfirmAction(server);
    this.#prepareGetAllCharactersAliases(server);
    this.#prepareGetAllIssuesForCharacter(server);
  };

  #prepareCharacterFromWikiPage = function (server) {
    server.post("/newCharacter", (req, res) => {
      this.#characterImporter.provideCharacterBaseInfoFromPageAsync(req.body["characterUrl"]).then(response => {
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
  };

  #prepareCharacterConfirmAction = function (server) {
    server.post("/confirmCharacter", (req, res) => {
      this.#characterImporter.downloadAndStoreConfirmedCharacterAsync(req.body).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on saving character and its appearances");
      });
    });
  };

  #prepareGetAllCharactersAliases = function (server) {
    server.get("/getAllCharacters", (req, res) => {
      res.end(JSON.stringify(this.#characterManager.provideAllCharactersAvailable()));
    });
  };

  #prepareGetAllIssuesForCharacter = function (server) {
    server.get("/getAllIssuesForCharacter", (req, res) => {
      const data = this.#characterManager.loadIssuesAndAppearances(req.query.alias, req.query.universe);
      const appearanceDictionary = this.#dictionaryManager.getDictionaryById("appearanceType");
      const focusDictionary = this.#dictionaryManager.getDictionaryById("focusType");
      data.setOfAppearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfAppearanceTypes, appearanceDictionary, true);
      data.setOfFocusTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfFocusTypes, focusDictionary, true);
      data.characterData.issues.forEach(issue => {
        issue.appearances.forEach(appearance => {
          appearance.appearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(appearance.appearanceTypes, appearanceDictionary, true);
        });
      });
      data.characterData.issues.forEach(issue => {
        issue.appearances.forEach(appearance => {
          appearance.focusType = this.#dictionaryTranslator.translateUsingDictionary(appearance.focusType, focusDictionary, true);
        });
      });
      res.end(JSON.stringify(data));
    });
  };
};