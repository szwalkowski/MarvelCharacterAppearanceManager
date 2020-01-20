let CharacterModel = function (id, url, alias, realName, world, image, issues, newest_issue_timestamp) {
    this.id = id;
    this.url = url;
    this.alias = alias;
    this.realName = realName;
    this.world = world;
    this.image = image;
    if (issues) {
        this.issues = issues;
    }
    if (newest_issue_timestamp) {
        this.newest_issue_timestamp = newest_issue_timestamp;
    }
};

CharacterModel.prototype.putNewIssue = function (issue) {

};

module.exports = CharacterModel;