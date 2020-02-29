module.exports = class {

  constructor(server, issueManager) {
    this.#setupEndpoints(server, issueManager);
  }

  #setupEndpoints = function (server, issueManager) {
    this.#prepareChangeStatusEndpoint(server, issueManager);
    this.#provideGetIssueDetails(server, issueManager);
  };

  #prepareChangeStatusEndpoint = function (server, issueManager) {
    server.post("/changeIssueStatus", (req, res) => {
      issueManager.changeIssueStatusAsync(req.body["issueId"], req.body["status"], req.body["idToken"], req.body["characterId"]).then(response => {
        res.end(JSON.stringify(response));
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end("Error on changing status of an issue");
      });
    });
  };

  #provideGetIssueDetails = function (server, issueManager) {
    server.get("/issueDetails", async (req, res) => {
      const issuePromise = issueManager.getIssueAsync(req.query.issueId);
      let readStatus;
      if (req.query.idToken) {
        const iterator = await issueManager.getIssueStatusForUserAsync(req.query.issueId, req.query.idToken);
        readStatus = (await iterator.toArray())[0];
      }
      const issueDetails = await issuePromise;
      if (readStatus && readStatus.issuesStatuses[0]) {
        const issueStatus = readStatus.issuesStatuses[0];
        if (issueStatus.status === "read") {
          issueDetails.read = true;
        } else if (issueStatus.status === "character") {
          issueDetails.read = false;
          issueDetails.appearances.forEach(appearance => {
            appearance.read = issueStatus.characters.indexOf(appearance.characterId) >= 0;
          });
        }
      }
      res.end(JSON.stringify(await issueDetails));
    });
  };
};