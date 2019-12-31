let IssueModel = function (url, name, subtitle, volume, issueNo, publishDateTimestamp, imageUrl, appearanceType, focusType, read = null) {
    this.url = url;
    this.name = name;
    this.subtitle = subtitle;
    this.volume = volume;
    this.issueNo = issueNo;
    this.publishDateTimestamp = publishDateTimestamp;
    this.imageUrl = imageUrl;
    this.appearanceType = appearanceType;
    this.focusType = focusType;
    this.read = read;
};

IssueModel.prototype.markAsRead = function () {
    this.read = Date.now();
};

IssueModel.prototype.markAsNotRead = function () {
    this.read = null;
};

module.exports = IssueModel;