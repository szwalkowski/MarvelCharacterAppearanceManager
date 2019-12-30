const JQuery = require('jquery');
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';

let IssuePageModel = function (issuePageWindow, characterUrl) {
    this.characterUrl = characterUrl;
    this.jquery = new JQuery(issuePageWindow);
    this.fullName = this.jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
    this.issueTextInfo = this.jquery.find(SelectorWithAllIssueData)[0].innerHTML.split("\n");
    this.indexOfValueInLine = this.issueTextInfo.find(value => value.includes("Image")).indexOf("=") + 2;
    prepareAppearanceInfo(this.issueTextInfo, this.characterUrl);
};

function prepareAppearanceInfo(textInfo, indexOfValueInLine, characterId) {
}

IssuePageModel.prototype.isIssue = function () {
    return this.issueTextInfo[0].includes("Marvel Database:Comic Template");
};

IssuePageModel.prototype.getName = function () {
    return this.fullName.split(" Vol ")[0];
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
    throw new Error("getImage not yet implemented!");
};

IssuePageModel.prototype.getPublishedDate = function () {
    const monthLine = this.issueTextInfo.find(line => line.includes("| Month"));
    const yearLine = this.issueTextInfo.find(line => line.includes("| Year"));
    const month = parseInt(monthLine.substring(this.indexOfValueInLine, this.indexOfValueInLine + 2));
    const year = parseInt(yearLine.substring(this.indexOfValueInLine, this.indexOfValueInLine + 4));
    return new Date(year, month - 1).getTime();
};

IssuePageModel.prototype.getAppearanceType = function () {
    return "DD";
};

IssuePageModel.prototype.getCharacterFocusType = function () {
    const nextElementToCharacterTypeAppearance = this.jQuery.find(`[href="${this.characterUrl}"]`)[0].nextElementSibling;
    if (!nextElementToCharacterTypeAppearance) {
        return "";
    }
    const regex = /\(.+\)/
    if (nextElementToCharacterTypeAppearance.nextElementSibling) {
        return regex.exec(nextElementToCharacterTypeAppearance.nextElementSibling.innerHTML)[0];
    }
    return regex.exec(nextElementToCharacterTypeAppearance.innerHTML)[0];
};

IssuePageModel.prototype.getSubtitle = function () {

};

module.exports = IssuePageModel;