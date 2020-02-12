const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionariesManager = require("../dictionaries/dictionariesManager");
const DictionaryTranslator = require("../dictionaries/dictionaryTranslator");

module.exports = class {
  #characterManager = new CharacterManager();
  #characterImporter = new CharacterImporter();
  #dictionaryTranslator = new DictionaryTranslator();

  constructor(server, dbConnection) {
    const dictionariesManager = new DictionariesManager(dbConnection);
    this.#createCharacterEndpoints(server, dictionariesManager);
  };

  #createCharacterEndpoints = function (server, dictionariesManager) {
    this.#prepareCharacterFromWikiPage(server);
    this.#prepareCharacterConfirmAction(server);
    this.#prepareGetAllCharactersAliases(server);
    this.#prepareGetAllIssuesForCharacter(server, dictionariesManager);
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

  #prepareGetAllIssuesForCharacter = function (server, dictionariesManager) {
    server.get("/getAllIssuesForCharacter", async (req, res) => {
      const data = this.#characterManager.loadIssuesAndAppearances(req.query.alias, req.query.universe);
      const appearanceDictionaryPromise = dictionariesManager.getDictionaryByIdAsync("appearanceType");
      const focusDictionaryPromise = dictionariesManager.getDictionaryByIdAsync("focusType");
      await Promise.all([
        appearanceDictionaryPromise.then(dictionary => {
          this.#translateAllAppearanceTypes(data, dictionary.dictionary);
        }),
        focusDictionaryPromise.then(dictionary => {
          this.#translateAllFocusTypes(data, dictionary.dictionary);
        })
      ]);
      res.end(JSON.stringify(data));
    });
  };

  #translateAllAppearanceTypes = function (data, dictionary) {
    data.setOfAppearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfAppearanceTypes, dictionary, true);
    data.characterData.issues.forEach(issue => {
      issue.appearances.forEach(appearance => {
        appearance.appearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(appearance.appearanceTypes, dictionary, true);
      });
    });
  };

  #translateAllFocusTypes = function (data, dictionary) {
    data.setOfFocusTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfFocusTypes, dictionary, true);
    data.characterData.issues.forEach(issue => {
      issue.appearances.forEach(appearance => {
        appearance.focusType = this.#dictionaryTranslator.translateUsingDictionary(appearance.focusType, dictionary, true);
      });
    });
  };
};