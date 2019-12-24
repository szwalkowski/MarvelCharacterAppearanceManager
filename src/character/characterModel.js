let CharacterModel = function (url, alias, realName, world, image, newest_issue_timestamp, issues) {
    this.url = url;
    this.alias = alias;
    this.realName = realName;
    this.world = world;
    this.image = image;
    this.newest_issue_timestamp = newest_issue_timestamp;
    this.issues = issues;
};

CharacterModel.prototype.putNewIssue = function(issue) {

};

module.exports = CharacterModel;