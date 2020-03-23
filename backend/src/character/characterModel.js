module.exports = class {

  constructor(id, url, aliases, realName, universe, image, issues, newestIssueTimestamp) {
    this._id = id;
    this.url = url;
    this.aliases = aliases;
    this.realName = realName;
    this.universe = universe;
    this.image = image;
    this.issues = issues;
    this.newestIssueTimestamp = newestIssueTimestamp;
  };

};