const fs = require('fs');
const CharacterModel = require('./characterModel');
const IssueModel = require('../issue/issueModel');

let CharacterManager = function () {
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
    fs.writeFile(`../appearances/${characterModel.id}.json`, JSON.stringify(characterModel), function (err) {
        if (err) {
            console.log(err);
        }
    });
    // transform this to those models from requires and save it?
};

module.exports = CharacterManager;