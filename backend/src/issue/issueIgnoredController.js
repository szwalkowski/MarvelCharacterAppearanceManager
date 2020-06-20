const { extractIdToken } = require("../utils");

module.exports = class {

  constructor(server, userAccountManager) {
    this.#setupEndpoints(server, userAccountManager);
  }

  #setupEndpoints = function (server, userAccountManager) {
    this.#getIgnoredIssues(server, userAccountManager);
    this.#postIgnoredIssue(server, userAccountManager);
    this.#deleteIgnoredIssue(server, userAccountManager);
  };

  #getIgnoredIssues = function (server, userAccountManager) {
    server.get("/issues/ignored", async (req, res) => {
      userAccountManager.findUserIgnoredIssuesAsync(extractIdToken(req))
        .then(issues => {
          res.end(JSON.stringify(issues.ignored.map(issueId => {
            return { issueId }
          })));
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #postIgnoredIssue = function (server, userAccountManager) {
    server.post("/issues/ignored/:issueId", async (req, res) => {
      userAccountManager.markIssueAsIgnoredAsync(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #deleteIgnoredIssue = function (server, userAccountManager) {
    server.delete("/issues/ignored/:issueId", async (req, res) => {
      userAccountManager.removeIssueFromIgnoredAsync(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };
};