const JQuery = require('jquery');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const containsComicsCategorySelector = ".page-header__categories-links > :contains('Comics')";
const headerSelector = ".page-header__title";
const imageSelector = "#templateimage .image-thumbnail > img";

let IssuePageModel = function (baseUrl, issuePageWindow) {
    this.baseUrl = baseUrl;
    this.jQuery = new JQuery(issuePageWindow);
    this.keywords = issuePageWindow.window.document.getElementsByTagName("meta")["keywords"]["content"].split(",").map(item => item.trim());
    this.fullName = this.keywords.find(value => new RegExp(".+(\\d)+ (\\d)+$").test(value));
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

IssuePageModel.prototype.getImage = function () {
    try {
        const elementWithImage = jQuery.find(selector)[0];
        if (elementWithImage.attributes["data-src"]) {
            return elementWithImage.attributes["data-src"]["value"];
        }
        return elementWithImage.attributes["src"]["value"];
    } catch (error) {
        console.error(`Error during finding element by ${selector}`);
        throw error;
    }
};

IssuePageModel.prototype.getPublishedDate = function () {
    const year = this.keywords.find(value => new RegExp("^\\d{4}$").test(value));
    const month = this.keywords.find(value => months.includes(value));
    return new Date(year, months.findIndex(value => value === month)).getTime();
};

module.exports = IssuePageModel;