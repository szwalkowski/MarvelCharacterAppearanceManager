module.exports = class {
  #issueManager;

  constructor(server, issueManager) {
    this.#issueManager = issueManager;
    this.#setupEndpoints(server);
  }

  #setupEndpoints = function (server) {
    this.#prepareChangeStatusEndpoint(server);
    this.#provideGetIssueDetails(server);
  };

  #prepareChangeStatusEndpoint = function (server) {
    server.post("/changeIssueStatus", (req, res) => {
      this.#issueManager.changeIssueStatusAsync(req.body["issueId"], req.body["status"], req.body["idToken"], req.body["characterId"]).then(response => {
        res.end(JSON.stringify(response));
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on changing status of an issue");
      });
    });
  };

  #provideGetIssueDetails = function (server) {
    server.get("/issueDetails", async (req, res) => {
      const issue = await this.#issueManager.getIssueAsync(req.query.issueId);
      res.end(JSON.stringify(issue));
    });
  };
};