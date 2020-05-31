const CharacterModel = require('./characterModel');

module.exports = class {
  #dbConnection;

  constructor(dbConnection) {
    this.#dbConnection = dbConnection;
  }

  async provideAllCharactersAvailableAsync() {
    const allCharactersCursor = await this.#dbConnection.findAsync("characters", {}, { displayName: 1, realName: 1, aliases: 1, universe: 1 });
    const allCharacters = await allCharactersCursor.toArray();
    const characters = [];
    allCharacters.forEach(character => {
      let existingCharacterWithAliasIdx = characters.findIndex(predicateCharacter => predicateCharacter.displayName === character.displayName);
      if (existingCharacterWithAliasIdx < 0) {
        existingCharacterWithAliasIdx = characters.length;
        characters.push({ displayName: character.displayName, realName: character.realName, aliases: character.aliases.join(","), universes: [] });
      }
      characters[existingCharacterWithAliasIdx].universes.push({ characterId: character._id, universe: character.universe });
    });
    return characters;
  };

  async saveCharacterAsync(characterAndIssues) {
    characterAndIssues.issues.sort((a, b) => this.#compareIssues(a, b));
    const characterModel = new CharacterModel(characterAndIssues.CharacterId, characterAndIssues.DisplayName, characterAndIssues.Url, characterAndIssues.Aliases,
      characterAndIssues.RealName, characterAndIssues.Universe, characterAndIssues.ImageUrl, characterAndIssues.issues,
      characterAndIssues.issues[characterAndIssues.issues.length - 1].publishDateTimestamp);
    return this.#dbConnection.saveAsync("characters", characterModel._id, characterModel);
  };

  async updateCharacterAsync(characterId, issuesToSave) {
    const characterData = await this.#dbConnection.findOneAsync("characters", { _id: characterId });
    this.#expandAppearances(characterData.issues, issuesToSave);
    characterData.issues.sort((a, b) => this.#compareIssues(a, b));
    characterData.newestIssueTimestamp = characterData.issues[characterData.issues.length - 1].publishDateTimestamp;
    await this.#dbConnection.saveAsync("characters", characterData._id, characterData);
    return characterData;
  }

  async loadIssuesAndAppearancesAsync(characterId) {
    const characterData = await this.#dbConnection.getByIdAsync("characters", characterId);
    const setOfAppearanceTypes = new Set();
    const setOfFocusTypes = new Set();
    characterData.issues.forEach(issue => {
      issue.appearances.forEach(appearanceInIssue => {
        appearanceInIssue.appearanceTypes.forEach(appearanceType => {
          setOfAppearanceTypes.add(appearanceType);
        });
        setOfFocusTypes.add(appearanceInIssue.focusType);
      });
    });
    characterData.issues.sort((a, b) => this.#compareIssues(a, b));
    return { characterData, setOfAppearanceTypes: [...setOfAppearanceTypes].sort(), setOfFocusTypes: [...setOfFocusTypes].sort() };
  };

  #expandAppearances = function(issues, issuesToSave) {
    for (const issueToUpdate of issuesToSave) {
      const foundIssue = issues.find(issue => issue.id === issueToUpdate.id);
      if (foundIssue) {
        issues.splice(issues.indexOf(foundIssue), 1);
      }
      issues.push(issueToUpdate);
    }
  }

  #compareIssues = function (a, b) {
    if (a.publishDateTimestamp !== b.publishDateTimestamp) {
      return a.publishDateTimestamp > b.publishDateTimestamp ? 1 : -1
    } else if (a.volume !== b.volume) {
      return a.volume > b.volume ? 1 : -1
    } else if (a.issueNo !== b.issueNo) {
      return a.issueNo > b.issueNo ? 1 : -1;
    }
    return 0;
  };
};