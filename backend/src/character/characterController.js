const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionaryManager = require("../dictionary/dictionaryManager");
const DictionaryTranslator = require("../dictionary/dictionaryTranslator");

module.exports = class {
  #dictionaryTranslator = new DictionaryTranslator();

  constructor(server, issueManager, userAccountManager, dbConnection) {
    const characterManager = new CharacterManager(dbConnection);
    const characterImporter = new CharacterImporter(issueManager, dbConnection);
    const dictionaryManager = new DictionaryManager(dbConnection);
    this.#createCharacterEndpoints(server, dictionaryManager, characterManager, characterImporter, userAccountManager);
  };

  #createCharacterEndpoints = function (server, dictionaryManager, characterManager, characterImporter, userAccountManager) {
    this.#prepareCharacterFromWikiPage(server, characterImporter);
    this.#prepareCharacterConfirmAction(server, characterImporter);
    this.#prepareGetAllCharactersAliases(server, characterManager);
    this.#prepareGetAllIssuesForCharacter(server, dictionaryManager, characterManager, userAccountManager);
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

  #prepareGetAllIssuesForCharacter = function (server, dictionaryManager, characterManager, userAccountManager) {
    server.get("/getAllIssuesForCharacter", async (req, res) => {
      const characterDataPromise = characterManager.loadIssuesAndAppearancesAsync(req.query.characterId);
      const appearanceDictionaryPromise = dictionaryManager.getDictionaryByIdAsync("appearanceType");
      const focusDictionaryPromise = dictionaryManager.getDictionaryByIdAsync("focusType");
      const userCharacterReadsPromise = req.query.idToken && userAccountManager.findUserByIdTokenAsync(req.query.idToken);
      await Promise.all([appearanceDictionaryPromise, focusDictionaryPromise, characterDataPromise, userCharacterReadsPromise])
        .then(values => {
          const appearanceDictionary = values[0].dictionary;
          const focusDictionary = values[1].dictionary;
          const data = values[2];
          const userCharacterReads = values[3] && values[3].issuesStatuses;

          data.setOfAppearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfAppearanceTypes, appearanceDictionary, true);
          data.setOfFocusTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfFocusTypes, focusDictionary, true);

          data.characterData.issues.forEach(issue => {
            issue.appearances.forEach(appearance => {
              appearance.appearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(appearance.appearanceTypes, appearanceDictionary, true);
              appearance.focusType = this.#dictionaryTranslator.translateUsingDictionary(appearance.focusType, focusDictionary, true);
            });
            const issueStatus = userCharacterReads && userCharacterReads.find(status => status.issueId === issue.id);
            if (issueStatus &&
              (issueStatus.status === "read" ||
                (issueStatus.status === "character" && issueStatus.characters.find(char => char === data.characterData._id)))
            ) {
              issue.status = issueStatus.status;
              issue.readTime = issueStatus.timestamp;
            } else {
              issue.status = null;
              issue.readTime = null;
            }
          });
          res.end(JSON.stringify(data));
        })
        .catch(err => {
          console.error(err);
          res.status(500);
          res.end();
        });
    });
  };
};