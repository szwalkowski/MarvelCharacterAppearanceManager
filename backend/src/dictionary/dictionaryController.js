const DictionaryManager = require('./dictionaryManager');
const { extractIdToken } = require("../utils");

module.exports = class {

  constructor(server, dbConnection, userAccountManager) {
    const dictionaryManager = new DictionaryManager(dbConnection);
    this.#createDictionaryEndpoints(server, dictionaryManager, userAccountManager);
  };

  #createDictionaryEndpoints = function (server, dictionaryManager, userAccountManager) {
    this.#prepareGetDictionary(server, dictionaryManager);
    this.#prepareSaveDictionary(server, dictionaryManager, userAccountManager);
  };

  #prepareGetDictionary = function (server, dictionaryManager) {
    server.get("/getDictionary", async (req, res) => {
      const dictionaryResponse = await dictionaryManager.getDictionaryByIdAsync(req.query.dictionaryId);
      const data = (dictionaryResponse && dictionaryResponse.dictionary) || [];
      data && data.sort((a, b) => {
        if (a.label === '-hide-') return -1;
        if (b.label === '-hide-') return 1;
        if (a.label > b.label) {
          return 1;
        }
        return -1;
      });
      data && data.forEach(d => d.values.sort((v1, v2) => v1 > v2 ? 1 : -1));
      res.end(JSON.stringify(data));
    });
  };

  #prepareSaveDictionary = function (server, dictionaryManager, userAccountManager) {
    server.post("/saveDictionary", async (req, res) => {
      const isAdmin = await userAccountManager.isAdminLoggedAsync(extractIdToken(req));
      if (isAdmin) {
        dictionaryManager.saveDictionaryAsync(req.body["dictionaryId"], req.body["dictionaryContent"]).then(() => {
          res.end();
        }, reason => {
          console.error(reason);
          res.status(500);
          res.end(`Error on saving dictionary: ${reason}`);
        });
      } else {
        res.status(401).end("Unauthorized");
      }
    });
  };
};