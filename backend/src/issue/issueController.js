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
  };

  #prepareChangeStatusEndpoint = function (server, issueManager) {
    server.post("/changeIssuesStatus", (req, res) => {
      issueManager.changeIssuesStatusAsync(req.body["issueIds"], req.body["status"], extractIdToken(req), req.body["characterId"]).then(response => {
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
      const issueId = req.query.issueId;
      const issuePromise = issueManager.getIssueAsync(issueId);
      let readStatus;
      const idToken = extractIdToken(req);
      if (idToken) {
        const iterator = await issueManager.getIssueStatusForUserAsync(idToken, issueId);
        readStatus = (await iterator.toArray())[0];
      }
      if (readStatus.issuesStatuses.length > 1) {
        readStatus.issuesStatuses = readStatus.issuesStatuses.filter(issueStatus => issueStatus.issueId === issueId);
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
      issueDetails.isFavourite = readStatus && readStatus.favourites && readStatus.favourites.includes(issueId);
      issueDetails.isIgnored = readStatus && readStatus.ignored && readStatus.ignored.includes(issueId);
      res.end(JSON.stringify(issueDetails));
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
          const ignoredIssues = values[1] && values[1].ignored;
          const favouriteIssues = values[1] && values[1].favourites;
          const filteredData = [];
          data.forEach(issue => {
            const isNotIgnored = !ignoredIssues || !ignoredIssues.includes(issue._id);
            if (isNotIgnored) {
              issue.isIgnored = false;
              issue.status = null;
              issue.isFavourite = favouriteIssues && favouriteIssues.includes(issue._id);
              const issueStatus = userCharacterReads && userCharacterReads.find(status => status.issueId === issue._id);
              if (issueStatus && issueStatus.status === "read") {
                issue.status = issueStatus.status;
              }
              issue.id = issue._id;
              filteredData.push(issue);
            }
          });
          res.end(JSON.stringify(filteredData));
        })
        .catch(error => {
          res.status(500).send(error.toString());
        });
    })
  };
};