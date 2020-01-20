let IssueModel = function (id, url, name, volume, issueNo, publishDateTimestamp, appearances, read = null) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.volume = volume;
    this.issueNo = issueNo;
    this.publishDateTimestamp = publishDateTimestamp;
    //this.imageUrl = imageUrl;
    this.appearances = appearances;
    this.read = read;
};

IssueModel.prototype.markAsRead = function () {
    this.read = Date.now();
};

IssueModel.prototype.markAsNotRead = function () {
    this.read = null;
};

module.exports = IssueModel;