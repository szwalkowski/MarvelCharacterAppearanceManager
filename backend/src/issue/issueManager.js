const fs = require('fs');
const collectionName = "issues";

module.exports = class {
  #dbConnection;

  constructor(dbConnection) {
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

  async markIssueAsReadAsync(issueId, characterAlias, characterUniverse) {
    const fileName = `../../database/appearances/${characterAlias.replace(/ /g, '_')}(${characterUniverse}).json`;
    const characterIssues = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    const readTimestamp = new Date().getTime();
    characterIssues.issues.find(issue => issue.id === issueId).read = readTimestamp;
    fs.writeFileSync(fileName, JSON.stringify(characterIssues));
    return readTimestamp;
  };

  async markIssueAsNotReadAsync(issueId, characterAlias, characterUniverse) {
    const fileName = `../../database/appearances/${characterAlias.replace(/ /g, '_')}(${characterUniverse}).json`;
    const characterIssues = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    characterIssues.issues.find(issue => issue.id === issueId).read = null;
    fs.writeFileSync(fileName, JSON.stringify(characterIssues));
  };

  #createIssue = function (issue) {
    return {
      _id: issue.id,
      name: issue.name,
      url: issue.url,
      volume: issue.volume,
      issueNo: issue.issueNo,
      publishDateTimestamp: issue.publishDateTimestamp,
      appearances: []
    };
  };

  #createAppearanceInIssue = function (issue, issueWithAppearance, characterData) {
    const characterId = characterData.CharacterId;
    this.#removeAppearanceOfCharacter(issue, characterId);
    issue.appearances.push({
      characterId,
      characterAlias: characterData.Alias,
      characterRealName: characterData.RealName,
      characterUniverse: characterData.Universe,
      characterAppearance: issueWithAppearance.appearances
    });
  };

  #removeAppearanceOfCharacter = function (issue, characterId) {
    const previousAppearanceIndex = issue.appearances.indexOf(appearance => appearance.characterId === characterId);
    if (previousAppearanceIndex > -1) {
      issue.appearances.splice(previousAppearanceIndex, 1);
    }
  };
};