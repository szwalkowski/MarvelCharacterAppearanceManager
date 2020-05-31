const collectionName = "issues";

module.exports = class {
  #dbConnection;
  #userAccountManager;

  constructor(userAccountManager, dbConnection) {
    this.#userAccountManager = userAccountManager;
    this.#dbConnection = dbConnection;
  }

  async addAppearanceToIssue(issueWithAppearance, characterData) {
    let issue = await this.#dbConnection.getByIdAsync(collectionName, issueWithAppearance.id);
    if (!issue) {
      issue = this.#createIssue(issueWithAppearance);
    }
    this.#createAppearanceInIssue(issue, issueWithAppearance, characterData);
    return await this.#dbConnection.saveAsync(collectionName, issue._id, issue);
  }

  async updateIssuesAndFindThoseThatDisappearedAsync(issueToUpdate) {
    let issue = await this.#dbConnection.getByIdAsync(collectionName, issueToUpdate._id);
    let charactersThatDisappeared = []
    if (!issue) {
      issue = issueToUpdate;
    } else {
      issue.image = issueToUpdate.image;
      issue.publishDateTimestamp = issueToUpdate.publishDateTimestamp;
      const oldSizeOfAppearances = issue.appearances.length;
      charactersThatDisappeared = this.#findThoseThatDisappeared(issue.appearances, issueToUpdate.appearances);
      issue.appearances = issueToUpdate.appearances;
      if (oldSizeOfAppearances !== issue.appearances.length) {
        console.log(`New characters appeared for ${issue._id} in count of ${issue.appearances.length - oldSizeOfAppearances}`);
      }
    }
    await this.#dbConnection.saveAsync(collectionName, issue._id, issue);
    return charactersThatDisappeared;
  }

  async changeIssuesStatusAsync(issueIds, newStatus, userIdToken, characterId) {
    const user = await this.#userAccountManager.findUserByIdTokenAsync(userIdToken);
    if (!user) {
      throw new Error("Not allowed to call this method");
    }
    const issueStatuses = {};
    issueIds.forEach(issueId => {
      if (!issueId) {
        throw new Error("Empty issue id!");
      }
      let issueStatus = user.issuesStatuses.find(iStatus => iStatus.issueId === issueId);
      if (!issueStatus) {
        issueStatus = {
          issueId,
          characters: []
        };
        user.issuesStatuses.push(issueStatus);
      }
      if (characterId) {
        this.#resolveCharacterId(issueStatus, newStatus, characterId);
      }
      if (newStatus !== "clear") {
        issueStatus.status = newStatus;
      }
      if (!issueStatus.characters.length && newStatus !== "read") {
        user.issuesStatuses = user.issuesStatuses.filter(iStatus => iStatus.issueId !== issueId);
      } else if (newStatus === "clear") {
        issueStatus.status = "character";
      }
      issueStatuses[issueId] = issueStatus;
      issueStatuses[issueId].status = newStatus;
    });
    await this.#dbConnection.saveAsync("users", user._id, user);
    return issueStatuses;
  }

  async getAllIssuesAndPackThemByVolumes() {
    const allIssuesIterator = await this.#dbConnection.findAsync("issues", {}, { name: 1, issueNo: 1, volume: 1, publishDateTimestamp: 1 });
    const allIssues = await allIssuesIterator.toArray();
    const packedIssued = {};
    allIssues.forEach(issue => {
      const nameWithoutAnnualAtEnd = issue.name.replace(/ Annual$/, "");
      let volumePack = packedIssued[nameWithoutAnnualAtEnd];
      if (!volumePack) {
        volumePack = {};
        packedIssued[nameWithoutAnnualAtEnd] = volumePack;
      }
      let volume = volumePack[issue.volume];
      if (!volume) {
        volumePack[issue.volume] = 0;
      }
      volumePack[issue.volume]++;
    });
    const orderedPack = {};
    Object.keys(packedIssued).sort().forEach(key => {
      orderedPack[key] = packedIssued[key];
    });
    return orderedPack;
  }

  async getIssueAsync(issueId) {
    return this.#dbConnection.findOneAsync("issues", { _id: issueId });
  }

  async getIssueStatusForUserAsync(issueId, idToken) {
    return this.#dbConnection.aggregateAsync(
      "users",
      {
        $match: { "sessionData.idToken": idToken }
      },
      {
        $project: {
          issuesStatuses: {
            $filter: {
              input: "$issuesStatuses",
              as: "issueStatus",
              cond: { $eq: ["$$issueStatus.issueId", issueId] }
            }
          },
          favourites: {
            $filter: {
              input: "$favourites",
              as: "favourite",
              cond: { $eq: ["$$favourite", issueId] }
            }
          },
          ignored: {
            $filter: {
              input: "$ignored",
              as: "ignore",
              cond: { $eq: ["$$ignore", issueId] }
            }
          }
        }
      }
    );
  }

  async getAllIssuesByVolume(issueName, issueVolume) {
    const iteratorOfVolumes = await this.#dbConnection.findAsync(
      "issues",
      { "name": issueName, "volume": issueVolume && parseInt(issueVolume) },
      { "issueNo": 1, "name": 1, "publishDateTimestamp": 1, "volume": 1, "appearances.characterAppearance.subtitle": 1 }
    );
    const volumes = await iteratorOfVolumes.toArray();
    volumes.sort((a, b) => this.#compareIssues(a, b));
    this.#reduceAndSortSubtitles(volumes);
    return volumes;
  }

  #createIssue = function (issue) {
    return {
      _id: issue.id,
      name: issue.name,
      url: issue.url,
      volume: issue.volume,
      issueNo: issue.issueNo,
      image: issue.image,
      publishDateTimestamp: issue.publishDateTimestamp,
      appearances: []
    };
  };

  #createAppearanceInIssue = function (issue, issueWithAppearance, characterData) {
    const characterId = characterData.CharacterId;
    this.#removeAppearanceOfCharacter(issue, characterId);
    issue.appearances.push({
      characterId,
      characterDisplayName: characterData.DisplayName,
      characterUniverse: characterData.Universe,
      characterAppearance: issueWithAppearance.appearances
    });
  };

  #removeAppearanceOfCharacter = function (issue, characterId) {
    const previousAppearanceIndex = issue.appearances.find(appearance => appearance.characterId === characterId);
    if (previousAppearanceIndex) {
      issue.appearances.splice(issue.appearances.indexOf(previousAppearanceIndex), 1);
    }
  };

  #findThoseThatDisappeared = function (oldAppearances, newAppearances) {
    const missingAppearances = [];
    for (const oldAppearance of oldAppearances) {
      if (!newAppearances.find(appearing => appearing.characterId === oldAppearance.characterId)) {
        missingAppearances.push(oldAppearance.characterId);
      }
    }
    return missingAppearances;
  }

  #resolveCharacterId = function (issueStatus, newStatus, characterId) {
    const existingCharacterId = issueStatus.characters.find(char => char === characterId);
    if (!existingCharacterId && ["character"] && newStatus !== "clear") {
      issueStatus.characters.push(characterId);
    } else if (newStatus === "clear") {
      issueStatus.characters = issueStatus.characters.filter(char => char !== characterId);
    }
  };

  #compareIssues = function (a, b) {
    if (a.publishDateTimestamp !== b.publishDateTimestamp) {
      return a.publishDateTimestamp > b.publishDateTimestamp ? 1 : -1
    } else if (a.issueNo !== b.issueNo) {
      return a.issueNo > b.issueNo ? 1 : -1;
    }
    return 0;
  };

  #reduceAndSortSubtitles = function (volumes) {
    volumes.forEach(issue => {
      issue.subtitles = [];
      if (issue.appearances) {
        issue.appearances.forEach(appearance => {
          appearance.characterAppearance.forEach(characterAppearance => {
            if (issue.subtitles.indexOf(characterAppearance.subtitle) < 0) {
              issue.subtitles.push(characterAppearance.subtitle);
            }
          });
        });
        issue.appearances = null;
      }
      issue.subtitles.sort();
    });
  };
};