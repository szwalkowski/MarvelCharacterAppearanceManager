const fs = require('fs');

const IssueManager = function () {
};

IssueManager.prototype.markIssueAsReadAsync = async function (issueId, characterAlias, characterUniverse) {
    const fileName = `../database/appearances/${characterAlias.replace(/ /g, '_')}(${characterUniverse}).json`;
    const characterIssues = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    const readTimestamp = new Date().getTime();
    for (let issue of characterIssues.issues) {
        if (issue.id === issueId) {
            issue.read = readTimestamp;
            break;
        }
    }
    fs.writeFileSync(fileName, JSON.stringify(characterIssues));
    return readTimestamp;
};

module.exports = IssueManager;