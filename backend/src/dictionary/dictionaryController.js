const DictionaryManager = require('./dictionaryManager');

module.exports = class {

  constructor(server, dbConnection) {
    const dictionaryManager = new DictionaryManager(dbConnection);
    this.#createDictionaryEndpoints(server, dictionaryManager);
  };

  #createDictionaryEndpoints = function (server, dictionaryManager) {
    this.#prepareGetDictionary(server, dictionaryManager);
    this.#prepareSaveDictionary(server, dictionaryManager);
  };

  #prepareGetDictionary = function (server, dictionaryManager) {
    server.get("/getDictionary", async (req, res) => {
      const data = (await dictionaryManager.getDictionaryByIdAsync(req.query.dictionaryId)).dictionary;
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

  #prepareSaveDictionary = function (server, dictionaryManager) {
    server.post("/saveDictionary", (req, res) => {
      dictionaryManager.saveDictionaryAsync(req.body["dictionaryId"], req.body["dictionaryContent"]).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on saving dictionary");
      });
    });
  };
};