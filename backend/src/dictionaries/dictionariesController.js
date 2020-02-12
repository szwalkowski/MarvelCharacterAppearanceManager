const DictionariesManager = require('./dictionariesManager');

module.exports = class {

  constructor(server, dbConnection) {
    const dictionariesManager = new DictionariesManager(dbConnection);
    this.#createDictionaryEndpoints(server, dictionariesManager);
  };

  #createDictionaryEndpoints = function (server, dictionariesManager) {
    this.#prepareGetDictionary(server, dictionariesManager);
    this.#prepareSaveDictionary(server, dictionariesManager);
  };

  #prepareGetDictionary = function (server, dictionariesManager) {
    server.get("/getDictionary", async (req, res) => {
      const data = (await dictionariesManager.getDictionaryByIdAsync(req.query.dictionaryId)).dictionary;
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

  #prepareSaveDictionary = function (server, dictionariesManager) {
    server.post("/saveDictionary", (req, res) => {
      dictionariesManager.saveDictionaryAsync(req.body["dictionaryId"], req.body["dictionaryContent"]).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on saving dictionary");
      });
    });
  };
};