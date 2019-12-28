const JQuery = require('jquery');
const containsComicsCategorySelector = ".page-header__categories-links > :contains('Comics')";
const headerSelector = ".page-header__title";

let IssuePageModel = function (baseUrl, issuePageWindow) {
    this.baseUrl = baseUrl;
    this.jQuery = new JQuery(issuePageWindow);
    this.fullName = this.jQuery.find(headerSelector)[0].innerHTML;
};

IssuePageModel.prototype.isIssue = function () {
    return this.jQuery.find(containsComicsCategorySelector).length > 0;
};

IssuePageModel.prototype.getName = function () {
    return this.fullName.split(" Vol")[0];
};

IssuePageModel.prototype.getVolume = function () {
    const separatedWords = this.fullName.split(" ");
    return parseInt(separatedWords[separatedWords.length - 2]);
};

IssuePageModel.prototype.getIssueNo = function () {
    const separatedWords = this.fullName.split(" ");
    return parseInt(separatedWords[separatedWords.length - 1]);
};

module.exports = IssuePageModel;