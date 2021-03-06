const IssueImageFinder = require('./issueImageFinder');
const IssuePageModel = require('./issuePageModel');
const PageDownloader = require("../pageDownloader");
const { extractIdToken } = require("../utils");

module.exports = class {
  #pageDownloader = new PageDownloader();

  constructor(server, issueManager, userAccountManager, issueMassUpdateService) {
    this.#setupEndpoints(server, issueManager, userAccountManager, issueMassUpdateService);
  }

  #setupEndpoints = function (server, issueManager, userAccountManager, issueMassUpdateService) {
    this.#prepareChangeStatusEndpoint(server, issueManager);
    this.#provideGetIssueDetails(server, issueManager);
    this.#provideUrlToIssueImage(server, new IssueImageFinder());
    this.#provideUrlToIssues(server, issueManager);
    this.#provideGetAllVolumeOfIssues(server, issueManager, userAccountManager);
    this.#providePostIssueUpload(server, issueMassUpdateService, userAccountManager);
    this.#provideGetIssuesRead(server, userAccountManager);
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
      if (readStatus && readStatus.issuesStatuses.length > 1) {
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
      const fullVolumeOfIssuesPromise = issueManager.getAllIssuesByVolumeWithAnnualsAsync(req.query.issueName, req.query.issueVolume);
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

  #providePostIssueUpload = function (server, issueMassUpdateService, userAccountManager) {
    server.post("/uploadIssue", async (req, res) => {
      const isAdmin = await userAccountManager.isAdminLoggedAsync(extractIdToken(req));
      if (isAdmin) {
        let issueUrl = `https://marvel.fandom.com/${req.body["issueUrl"]}?action=edit`;
        this.#pageDownloader.downloadWindowFromUrlAsync(issueUrl).then(
          async issuePage => {
            console.log(`Page downloaded! ${req.body["issueUrl"]}`);
            const issuePageModel = new IssuePageModel(issuePage, req.body["issueUrl"]);
            if (issuePageModel.isIssue) {
              await issueMassUpdateService.updateIssuesAsync([issuePageModel]);
              res.end();
            } else {
              res.status(500);
              res.end("It's not an issue!");
            }
          }
        ).catch(reason => {
          console.error(reason);
          res.status(500);
          res.end(`Problem downloading ${issueUrl}.`);
        });
      } else {
        res.status(401).end("Unauthorized");
      }
    })
  };

  #provideGetIssuesRead = function (server, userAccountManager) {
    server.get("/issues/read", async (req, res) => {
      const user = await userAccountManager.findUserByIdTokenAsync(extractIdToken(req));
      if (!user) {
        res.status(401).end("Unauthorized");
      } else {
        userAccountManager.findUserByIdTokenAsync(extractIdToken(req))
          .then(user => {
            user.issuesStatuses.sort((a, b) => {
              if (a.updateTime) {
                if (b.updateTime) {
                  if (a.updateTime > b.updateTime) {
                    return -1;
                  }
                  return 1;
                }
                return -1;
              }
              if (b.updateTime) {
                return 1;
              }
              return 0;
            });
            res.end(JSON.stringify(user.issuesStatuses));
          })
          .catch(error => {
            res.status(500).send(error.toString());
          });
      }
    })
  };
};