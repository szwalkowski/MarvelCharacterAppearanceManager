module.exports = class {

  constructor(id, url, alias, realName, world, image, issues, newestIssueTimestamp) {
    this.id = id;
    this.url = url;
    this.alias = alias;
    this.realName = realName;
    this.world = world;
    this.image = image;
    this.issues = issues;
    this.newestIssueTimestamp = newestIssueTimestamp;
  };

};