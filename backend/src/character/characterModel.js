module.exports = class {

  constructor(id, url, alias, realName, universe, image, issues, newestIssueTimestamp) {
    this._id = id;
    this.url = url;
    this.alias = alias;
    this.realName = realName;
    this.universe = universe;
    this.image = image;
    this.issues = issues;
    this.newestIssueTimestamp = newestIssueTimestamp;
  };

};