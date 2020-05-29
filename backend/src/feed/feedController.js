const FeedManager = require("./feedManager");
const { extractIdToken } = require("../utils");

module.exports = class {
  #feedManager;

  constructor(server, userAccountManager, dbConnection) {
    this.#feedManager = new FeedManager(dbConnection);
    this.#createFeedEndpoints(server, userAccountManager);
  };

  #createFeedEndpoints = function (server, userAccountManager) {
    this.#prepareForceFeedUpdate(server, userAccountManager);
  };

  #prepareForceFeedUpdate = function (server, userAccountManager) {
    server.get("/feedUpdate", async (req, res) => {
      const isAdmin = await userAccountManager.isAdminLoggedAsync(extractIdToken(req));
      if (isAdmin) {
        await this.#feedManager.initiateUpdateProcess();
        res.end();
      } else {
        res.status(401).end("Unauthorized");
      }
    });
  };
};