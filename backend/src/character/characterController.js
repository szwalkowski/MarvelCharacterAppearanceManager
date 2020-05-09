const CharacterImporter = require("./characterImporter");
const CharacterManager = require("./characterManager");
const DictionaryManager = require("../dictionary/dictionaryManager");
const DictionaryTranslator = require("../dictionary/dictionaryTranslator");
const { extractIdToken } = require("../utils");

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
    this.#prepareGetAllCharacters(server, characterManager);
    this.#prepareGetAllIssuesForCharacter(server, dictionaryManager, characterManager, userAccountManager);
  };

  #prepareCharacterFromWikiPage = function (server, characterImporter) {
    server.post("/newCharacter", (req, res) => {
      characterImporter.provideCharacterBaseInfoFromPageAsync(req.body["characterUrl"]).then(response => {
        res.end(JSON.stringify({
          CharacterId: response.getId(),
          Url: req.body["characterUrl"],
          Aliases: response.getAliases(),
          Universe: response.getUniverse(),
          RealName: response.getRealName(),
          AppearanceCount: response.getAppearancesCount(),
          MinorAppearanceCount: response.getMinorAppearancesCount(),
          AppearanceUrl: response.getAppearancesUrl(),
          MinorAppearanceUrl: response.getMinorAppearancesUrl(),
          ImageUrl: response.getImage(),
          DisplayName: response.getCurrentAlias() || response.getRealName()
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

  #prepareGetAllCharacters = function (server, characterManager) {
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
      const idToken = extractIdToken(req);
      const userCharacterReadsPromise = idToken && userAccountManager.findUserByIdTokenAsync(idToken);
      await Promise.all([appearanceDictionaryPromise, focusDictionaryPromise, characterDataPromise, userCharacterReadsPromise])
        .then(values => {
          const appearanceDictionary = values[0] && values[0].dictionary;
          const focusDictionary = values[1] && values[1].dictionary;
          const data = values[2];
          const userCharacterReads = values[3] && values[3].issuesStatuses;
          const ignoredIssues = values[3] && values[3].ignored;
          const favouriteIssues = values[3] && values[3].favourites;

          if (appearanceDictionary) {
            data.setOfAppearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfAppearanceTypes, appearanceDictionary, true);
          }
          if (focusDictionary) {
            data.setOfFocusTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(data.setOfFocusTypes, focusDictionary, true);
          }

          const filteredAndMarkedIssues = [];
          data.characterData.issues.forEach(issue => {
            const isNotIgnored = !ignoredIssues || !ignoredIssues.includes(issue.id);
            if (isNotIgnored) {
              issue.isIgnored = false;
              issue.appearances.forEach(appearance => {
                if (appearanceDictionary) {
                  appearance.appearanceTypes = this.#dictionaryTranslator.translateArrayUsingDictionary(appearance.appearanceTypes, appearanceDictionary, true);
                }
                if (focusDictionary) {
                  appearance.focusType = this.#dictionaryTranslator.translateUsingDictionary(appearance.focusType, focusDictionary, true);
                }
              });
              const issueStatus = userCharacterReads && userCharacterReads.find(status => status.issueId === issue.id);
              issue.isFavourite = favouriteIssues && favouriteIssues.includes(issue.id);
              if (issueStatus &&
                (issueStatus.status === "read" ||
                  (issueStatus.status === "character" && issueStatus.characters.find(char => char === data.characterData._id)))) {
                issue.status = issueStatus.status;
                filteredAndMarkedIssues.push(issue);
              } else {
                issue.status = null;
                filteredAndMarkedIssues.push(issue);
              }
            }
          });
          data.characterData.issues = filteredAndMarkedIssues;
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