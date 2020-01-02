const fs = require('fs');
const CharacterModel = require('./characterModel');
const IssueModel = require('../issue/issueModel');

let CharacterManager = function () {
};

CharacterManager.prototype.provideAllCharactersAvailable = function () {
    let characters = [];
    fs.readdirSync('../appearances').forEach(file => {
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
    const issues = [];
    characterAndIssues.issues.forEach(issue => {
        const appearancesInIssue = [];
        issue.appearances.forEach(appearance => {
            appearancesInIssue.push({
                subtitle: appearance.title,
                focusType: appearance.focusType,
                appearanceType: appearance.typeOfAppearance
            });
        });
        const issueModel = new IssueModel(issue.url, issue.getName(), issue.getVolume(), issue.getIssueNo(), issue.getPublishedDate(), appearancesInIssue);
        issues.push(issueModel);
    });
    issues.sort((a, b) => (a.publishDateTimestamp > b.publishDateTimestamp) ? 1 : -1);
    const characterModel = new CharacterModel(characterAndIssues.CharacterId.replace(/ /g, "_"), characterAndIssues.Url, characterAndIssues.SetAlias,
        characterAndIssues.RealName, characterAndIssues.Universe, characterAndIssues.ImageUrl, issues, issues[issues.length - 1].publishDateTimestamp);
    saveToFile(characterModel);
};

CharacterManager.prototype.loadIssues = function (alias, universe) {
    const fileName = `${alias}(${universe}).json`;
    const fileContent = fs.readFileSync(`../appearances/${fileName}`, "utf-8");
    return fileContent;
};

function saveToFile(characterModel) {
    const characterModelAsJson = JSON.stringify(characterModel);
    const fileName = `../appearances/${characterModel.alias.replace(/ /g, "_")}(${characterModel.world}).json`;
    fs.writeFileSync(fileName, characterModelAsJson, function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}

module.exports = CharacterManager;