const IssueModel = require("./issueModel");
const CharacterManager = require("../character/characterManager");

module.exports = class {
  #dbConnection;
  #characterManager;
  #issueManager;

  constructor(issueManager, dbConnection) {
    this.#dbConnection = dbConnection;
    this.#characterManager = new CharacterManager(dbConnection);
    this.#issueManager = issueManager;
  };

  async updateIssuesAsync(allIssuesPageModels) {
    if (!allIssuesPageModels.length) {
      return false;
    }
    const charactersOfInterest = await this.#createListOfCharactersOfInterestAsync(allIssuesPageModels);
    const issuesToUpdate = [];
    for (const character of charactersOfInterest) {
      const issuesToSave = [];
      for (const issuePageModel of allIssuesPageModels) {
        const appearancesInIssue = issuePageModel.getAppearances(character);
        if (appearancesInIssue.length) {
          issuesToSave.push(this.#createIssueModel(issuePageModel, appearancesInIssue));
        }
      }
      const issuesWithCharacters = await this.#updateCharacterAndGetAllItsIssuesWithAppearancesAsync(issuesToSave, character);
      this.#mergeIssuesToUpdate(issuesToUpdate, issuesWithCharacters);
    }
    for (const issue of issuesToUpdate) {
      await this.#issueManager.updateIssuesAsync(issue)
    }
    return true;
  };

  #updateCharacterAndGetAllItsIssuesWithAppearancesAsync = async function (issuesToSave, character) {
    const issuesToUpdate = [];
    if (issuesToSave.length) {
      console.log(`Updating ${character} inside of: ${issuesToSave.map(issue => issue.id).join(",")}`);
      const characterData = await this.#characterManager.updateCharacterAsync(character, issuesToSave);
      for (const issue of issuesToSave) {
        let foundIssue = issuesToUpdate.find(issueToUpdate => issueToUpdate.id === issue.id);
        if (!foundIssue) {
          foundIssue = {
            _id: issue.id,
            name: issue.name,
            url: issue.url,
            volume: issue.volume,
            issueNo: issue.issueNo,
            image: issue.image,
            publishDateTimestamp: issue.publishDateTimestamp,
            appearances: []
          }
          issuesToUpdate.push(foundIssue);
        }
        foundIssue.appearances.push({
          characterId: character,
          characterDisplayName: characterData.displayName,
          characterUniverse: characterData.universe,
          characterAppearance: issue.appearances
        });
      }
    }
    return issuesToUpdate;
  }

  #createIssueModel = function (issue, appearancesInIssue) {
    const appearancesToStore = appearancesInIssue.map(appearance => {
      return {
        ordinal: appearance.storyOrdinal,
        subtitle: appearance.title,
        focusType: appearance.focusType,
        appearanceTypes: appearance.typesOfAppearance
      };
    });
    return new IssueModel(issue.id, issue.url, issue.getName(), issue.getVolume(), issue.getIssueNo(), issue.getPublishedDate(), issue.getImage(),
      appearancesToStore);
  };

  #createListOfCharactersOfInterestAsync = async function (allIssuesPageModels) {
    const allStoredCharactersPromise = this.#dbConnection.findAsync("characters", {}, { _id: 1 });
    const allRelatedCharacters = new Set();
    allIssuesPageModels.forEach(issue => issue.getAllAppearingIds().forEach(appearingId => allRelatedCharacters.add(appearingId)));
    const listOfCharactersOfInterest = [];
    const allStoredCharacters = await (await allStoredCharactersPromise).toArray();
    for (const character of allRelatedCharacters) {
      if (allStoredCharacters.find(storedChar => storedChar._id === character)) {
        listOfCharactersOfInterest.push(character);
      }
    }
    return listOfCharactersOfInterest;
  };

  #mergeIssuesToUpdate = function (issuesToUpdate, issuesWithCharacters) {
    for (const issue of issuesWithCharacters) {
      const foundIssue = issuesToUpdate.find(i => i._id === issue._id);
      if (foundIssue) {
        foundIssue.appearances.push(...issue.appearances);
      } else {
        issuesToUpdate.push(issue);
      }
    }
  }
}