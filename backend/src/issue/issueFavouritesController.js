const { extractIdToken } = require("../utils");

module.exports = class {

  constructor(server, userAccountManager) {
    this.#setupEndpoints(server, userAccountManager);
  }

  #setupEndpoints = function (server, userAccountManager) {
    this.#getFavouritesIssues(server, userAccountManager);
    this.#postFavouriteIssue(server, userAccountManager);
    this.#deleteFavouriteIssue(server, userAccountManager);
  };

  #getFavouritesIssues = function (server, userAccountManager) {
    server.get("/issues/favourites", async (req, res) => {
      userAccountManager.findUserFavouritesIssuesAsync(extractIdToken(req))
        .then(issues => {
          res.end(JSON.stringify(issues.favourites.map(issueId => {
            return { issueId }
          })));
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #postFavouriteIssue = function (server, userAccountManager) {
    server.post("/issues/favourites/:issueId", async (req, res) => {
      userAccountManager.markIssueAsFavouriteAsync(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #deleteFavouriteIssue = function (server, userAccountManager) {
    server.delete("/issues/favourites/:issueId", async (req, res) => {
      userAccountManager.removeIssueFromFavouriteAsync(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };
};