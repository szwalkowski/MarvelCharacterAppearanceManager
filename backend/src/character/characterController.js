const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionaryManager = require("../dictionary/dictionaryManager");
const DictionaryTranslator = require("../dictionary/dictionaryTranslator");

module.exports = class {
  #dictionaryTranslator = new DictionaryTranslator();

  constructor(server, dbConnection) {
    const characterManager = new CharacterManager(dbConnection);
    const characterImporter = new CharacterImporter(dbConnection);
    const dictionaryManager = new DictionaryManager(dbConnection);
    this.#createCharacterEndpoints(server, dictionaryManager, characterManager, characterImporter);
  };

  #createCharacterEndpoints = function (server, dictionaryManager, characterManager, characterImporter) {
    this.#prepareCharacterFromWikiPage(server, characterImporter);
    this.#prepareCharacterConfirmAction(server, characterImporter);
    this.#prepareGetAllCharactersAliases(server, characterManager);
    this.#prepareGetAllIssuesForCharacter(server, dictionaryManager, characterManager);
  };

  #prepareCharacterFromWikiPage = function (server, characterImporter) {
    server.post("/newCharacter", (req, res) => {
      characterImporter.provideCharacterBaseInfoFromPageAsync(req.body["characterUrl"]).then(response => {
        res.end(JSON.stringify({
          CharacterId: response.getId(),
          Url: req.body["characterUrl"],
          OriginAlias: response.getCurrentAlias(),
          Alias: req.body["customAlias"].trim() === "" ? response.getCurrentAlias().trim() : req.body["customAlias"],
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

  #prepareCharacterConfirmAction = function (server, characterImporter) {
    server.post("/confirmCharacter", (req, res) => {
      characterImporter.downloadAndStoreConfirmedCharacterAsync(req.body).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on saving character and its appearances");
      });
    });
  };

  #prepareGetAllCharactersAliases = function (server, characterManager) {
    server.get("/getAllCharacters", async (req, res) => {
      const characters = await characterManager.provideAllCharactersAvailableAsync();
      res.end(JSON.stringify(characters));
    });
  };

  #prepareGetAllIssuesForCharacter = function (server, dictionaryManager, characterManager) {
    server.get("/getAllIssuesForCharacter", async (req, res) => {
      const characterDataPromise = characterManager.loadIssuesAndAppearancesAsync(req.query.characterId);
      const appearanceDictionaryPromise = dictionaryManager.getDictionaryByIdAsync("appearanceType");
      const focusDictionaryPromise = dictionaryManager.getDictionaryByIdAsync("focusType");
      const data = await characterDataPromise;
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