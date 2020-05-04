const IssueImageFinder = require('./issueImageFinder');
const { extractIdToken } = require("../utils");

module.exports = class {

  constructor(server, issueManager, userAccountManager) {
    this.#setupEndpoints(server, issueManager, userAccountManager);
  }

  #setupEndpoints = function (server, issueManager, userAccountManager) {
    this.#prepareChangeStatusEndpoint(server, issueManager);
    this.#provideGetIssueDetails(server, issueManager);
    this.#provideUrlToIssueImage(server, new IssueImageFinder());
    this.#provideUrlToIssues(server, issueManager);
    this.#provideGetAllVolumeOfIssues(server, issueManager, userAccountManager);
    this.#provideUrlToIgnoredIssues(server, userAccountManager);
    this.#markIssueAsIgnored(server, userAccountManager);
    this.#markIssueAsNotIgnored(server, userAccountManager);
  };

  #prepareChangeStatusEndpoint = function (server, issueManager) {
    server.post("/changeIssueStatus", (req, res) => {
      issueManager.changeIssueStatusAsync(req.body["issueId"], req.body["status"], extractIdToken(req), req.body["characterId"]).then(response => {
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
      const idToken = extractIdToken(req);
      if (idToken) {
        const iterator = await issueManager.getIssueStatusForUserAsync(req.query.issueId, idToken);
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

  #provideUrlToIssueImage = function (server, issueImageFinder) {
    server.get("/issueImageUrl", async (req, res) => {
      const imageUrl = await issueImageFinder.getImageUrlForImageIdAsync(req.query.issueId, req.query.imageId);
      res.end(JSON.stringify({ imageUrl }));
    })
  };

  #provideUrlToIssues = function (server, issueManager) {
    server.get("/issues", async (req, res) => {
      const allIssuesPackedInVolumes = await issueManager.getAllIssuesAndPackThemByVolumes();
      res.end(JSON.stringify(allIssuesPackedInVolumes));
    })
  };

  #provideGetAllVolumeOfIssues = function (server, issueManager, userAccountManager) {
    server.get("/getAllVolumeOfIssues", async (req, res) => {
      const fullVolumeOfIssuesPromise = issueManager.getAllIssuesByVolume(req.query.issueName, req.query.issueVolume);
      const idToken = extractIdToken(req);
      const userCharacterReadsPromise = idToken && userAccountManager.findUserByIdTokenAsync(idToken);
      await Promise.all([fullVolumeOfIssuesPromise, userCharacterReadsPromise])
        .then(values => {
          const data = values[0];
          const userCharacterReads = values[1] && values[1].issuesStatuses;
          data.forEach(issue => {
            issue.status = null;
            const issueStatus = userCharacterReads && userCharacterReads.find(status => status.issueId === issue._id);
            if (issueStatus && issueStatus.status === "read") {
              issue.status = issueStatus.status;
            }
          });
          res.end(JSON.stringify(data));
        })
        .catch(error => {
          res.status(500).send(error.toString());
        });
    })
  };

  #provideUrlToIgnoredIssues = function (server, userAccountManager) {
    server.get("/issues/ignored", async (req, res) => {
      userAccountManager.findUserIgnoredIssuesAsync(extractIdToken(req))
        .then(ignoredIssues => {
          res.end(JSON.stringify(ignoredIssues));
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #markIssueAsIgnored = function (server, userAccountManager) {
    server.put("/issues/:issueId/ignore", async (req, res) => {
      userAccountManager.addIssueToIgnored(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };

  #markIssueAsNotIgnored = function (server, userAccountManager) {
    server.put("/issues/:issueId/un-ignore", async (req, res) => {
      userAccountManager.removeIssueFromIgnored(extractIdToken(req), req.params.issueId)
        .then(() => {
          res.end();
        })
        .catch(error => {
          res.status(500).send(error.toString());
        })
    })
  };
};