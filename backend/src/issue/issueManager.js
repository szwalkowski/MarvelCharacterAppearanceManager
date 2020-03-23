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

  async changeIssueStatusAsync(issueId, newStatus, userIdToken, characterId) {
    const user = await this.#userAccountManager.findUserByIdTokenAsync(userIdToken);
    if (!user) {
      throw new Error("Not allowed to call this method");
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
    if (!issueStatus.characters.length) {
      user.issuesStatuses = user.issuesStatuses.filter(iStatus => iStatus.issueId !== issueId);
    } else if (newStatus === "clear") {
      issueStatus.status = "character";
    }
    await this.#dbConnection.saveAsync("users", user._id, user);
    issueStatus.status = newStatus;
    return issueStatus;
  }

  async getIssueAsync(issueId) {
    return this.#dbConnection.findOneAsync("issues", { _id: issueId });
  }

  async getIssueStatusForUserAsync(issueId, idToken) {
    return this.#dbConnection.findAsync(
      "users",
      { "sessionData.idToken": idToken, "issuesStatuses.issueId": issueId },
      { "issuesStatuses.$": 1 });
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
      characterAliases: characterData.Aliases,
      characterRealName: characterData.RealName,
      characterUniverse: characterData.Universe,
      characterAppearance: issueWithAppearance.appearances
    });
  };

  #removeAppearanceOfCharacter = function (issue, characterId) {
    const previousAppearanceIndex = issue.appearances.find(appearance => appearance.characterId === characterId);
    if (previousAppearanceIndex) {
      issue.appearances.splice(previousAppearanceIndex, 1);
    }
  };

  #resolveCharacterId = function (issueStatus, newStatus, characterId) {
    const existingCharacterId = issueStatus.characters.find(char => char === characterId);
    if (!existingCharacterId && ["read", "character"]) {
      issueStatus.characters.push(characterId);
    } else if (newStatus === "clear") {
      issueStatus.characters = issueStatus.characters.filter(char => char !== characterId);
    }
  }
};