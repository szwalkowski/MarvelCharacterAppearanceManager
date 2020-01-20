const fs = require('fs');

const IssueManager = function () {
};

IssueManager.prototype.markIssueAsReadAsync = async function (issueId, characterAlias, characterUniverse) {
    const fileName = `../../database/appearances/${characterAlias.replace(/ /g, '_')}(${characterUniverse}).json`;
    const characterIssues = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    const readTimestamp = new Date().getTime();
    characterIssues.issues.find(issue => issue.id === issueId).read = readTimestamp;
    fs.writeFileSync(fileName, JSON.stringify(characterIssues));
    return readTimestamp;
};

IssueManager.prototype.markIssueAsNotReadAsync = async function (issueId, characterAlias, characterUniverse) {
    const fileName = `../../database/appearances/${characterAlias.replace(/ /g, '_')}(${characterUniverse}).json`;
    const characterIssues = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    characterIssues.issues.find(issue => issue.id === issueId).read = null;
    fs.writeFileSync(fileName, JSON.stringify(characterIssues));
};

module.exports = IssueManager;