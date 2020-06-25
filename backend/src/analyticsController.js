module.exports = class {

  constructor(server, dbConnection) {
    this.#createDictionaryEndpoints(server, dbConnection);
  };

  #createDictionaryEndpoints = function (server, dbConnection) {
    this.#storeAnalytics(server, dbConnection);
  };

  #storeAnalytics = function (server, dbConnection) {
    server.post("/storeAnalytics", async (req, res) => {
      const event = req.body["event"];
      event.howDifferent = event.howDifferent.slice(0, 1000);
      dbConnection.insertAsync("analytics", event);
      res.end();
    });
  };
};