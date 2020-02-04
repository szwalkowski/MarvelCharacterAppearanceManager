const IssueManager = require('./issueManager');

module.exports = class {
  #issueManager = new IssueManager();

  constructor(server) {
    this.#setupEndpoints(server);
  }

  #setupEndpoints = function (server) {
    this.#prepareMarkAsReadEndpoint(server);
    this.#prepareUnmarkAsReadEndpoint(server);
  };

  #prepareMarkAsReadEndpoint = function (server) {
    server.post("/markIssueAsRead", (req, res) => {
      this.#issueManager.markIssueAsReadAsync(req.body["issueId"], req.body["characterAlias"], req.body["characterUniverse"]).then(response => {
        res.end(JSON.stringify({ issueId: req.body["issueId"], readTime: response }));
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on marking as read an issue");
      });
    });
  };

  #prepareUnmarkAsReadEndpoint = function (server) {
    server.post("/unmarkIssueAsRead", (req, res) => {
      this.#issueManager.markIssueAsNotReadAsync(req.body["issueId"], req.body["characterAlias"], req.body["characterUniverse"]).then(() => {
        res.end(JSON.stringify({ issueId: req.body["issueId"] }));
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on marking as read an issue");
      });
    });
  };
};