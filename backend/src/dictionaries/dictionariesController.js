const DictionaryManager = require('./dictionariesManager');

module.exports = class {
  #dictionaryManager = new DictionaryManager();

  constructor(server) {
    this.#createDictionaryEndpoints(server);
  };

  #createDictionaryEndpoints = function (server) {
    this.#prepareGetDictionary(server);
    this.#prepareSaveDictionary(server);
  };

  #prepareGetDictionary = function (server) {
    server.get("/getDictionary", (req, res) => {
      const data = this.#dictionaryManager.getDictionaryById(req.query.dictionaryId);
      data.sort((a, b) => {
        if (a.label === '-hide-') return -1;
        if (b.label === '-hide-') return 1;
        if (a.label > b.label) {
          return 1;
        }
        return -1;
      });
      data.forEach(d => d.values.sort((v1, v2) => v1 > v2 ? 1 : -1));
      res.end(JSON.stringify(data));
    });
  };

  #prepareSaveDictionary = function (server) {
    server.post("/saveDictionary", (req, res) => {
      this.#dictionaryManager.saveDictionaryAsync(req.body["dictionaryId"], req.body["dictionaryContent"]).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on saving dictionary");
      });
    });
  };
};