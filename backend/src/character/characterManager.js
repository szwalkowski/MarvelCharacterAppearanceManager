const fs = require('fs');
const CharacterModel = require('./characterModel');
const IssueModel = require('../issue/issueModel');

let CharacterManager = function () {
};

CharacterManager.prototype.provideAllCharactersAvailable = function () {
    let characters = [];
    fs.readdirSync('../../database/appearances').forEach(file => {
        const alias = /[a-zA-Z/d_]+/.exec(file)[0];
        const universeWithBrackets = /\([a-zA-Z\d-]+\)/.exec(file)[0];
        const universe = universeWithBrackets.substring(1, universeWithBrackets.length - 1);
        let existingCharacterWithAliasIdx = characters.findIndex(character => character.alias === alias);
        if (existingCharacterWithAliasIdx < 0) {
            existingCharacterWithAliasIdx = characters.length;
            characters.push({alias, universes: []});
        }
        characters[existingCharacterWithAliasIdx].universes.push(universe);
    });
    return characters;
};

CharacterManager.prototype.saveCharacter = function (characterAndIssues) {
    characterAndIssues.issues.sort((a, b) => compareIssues(a, b));
    const characterModel = new CharacterModel(characterAndIssues.CharacterId.replace(/ /g, "_"), characterAndIssues.Url, characterAndIssues.SetAlias,
        characterAndIssues.RealName, characterAndIssues.Universe, characterAndIssues.ImageUrl, characterAndIssues.issues,
        characterAndIssues.issues[characterAndIssues.issues.length - 1].publishDateTimestamp);
    saveToFile(characterModel);
};

CharacterManager.prototype.loadIssuesAndAppearances = function (alias, universe) {
    const fileName = `${alias}(${universe}).json`;
    const fileContent = fs.readFileSync(`../../database/appearances/${fileName}`, "utf-8");
    const characterData = JSON.parse(fileContent);
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
    return {characterData, setOfAppearanceTypes: [...setOfAppearanceTypes].sort(), setOfFocusTypes: [...setOfFocusTypes].sort()};
};

function saveToFile(characterModel) {
    const characterModelAsJson = JSON.stringify(characterModel);
    const fileName = `../../database/appearances/${characterModel.alias.replace(/ /g, "_")}(${characterModel.world}).json`;
    fs.writeFileSync(fileName, characterModelAsJson, function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}

function compareIssues(a, b) {
    if (a.publishDateTimestamp !== b.publishDateTimestamp) {
        return a.publishDateTimestamp > b.publishDateTimestamp ? 1 : -1
    } else if (a.name === b.name) {
        return 0;
    } else if (a.volume !== b.volume) {
        return a.volume > b.volume ? 1 : -1
    }
    return a.issueNo > b.issueNo ? 1 : -1
}

module.exports = CharacterManager;