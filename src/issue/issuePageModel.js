const JQuery = require('jquery');
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const regexForAppearanceTypeOptionOne = /\{[a-zA-Z\d]+}}$/;
const regexForAppearanceTypeOptionTwo = /\|[a-zA-Z\d]+}}$/;

let IssuePageModel = function (issuePageWindow, characterId) {
    this.characterId = characterId;
    this.jquery = new JQuery(issuePageWindow);
    this.fullName = this.jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
    this.issueTextInfo = this.jquery.find(SelectorWithAllIssueData)[0].innerHTML.split("\n");
    this.isIssue = this.issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
    if (this.isIssue) {
        this.indexOfValueInLine = this.issueTextInfo.find(value => value.includes("Image")).indexOf("=") + 2;
        this.appearances = prepareAppearanceInfo(this.issueTextInfo, this.indexOfValueInLine, this.characterId);
    }
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

IssuePageModel.prototype.getAppearances = function () {
    return this.appearances;
};

function prepareAppearanceInfo(textInfo, indexOfValueInLine, characterId) {
    let allAppearings = [];
    let newAppearing;
    const stringThatContainsStoryTitle = "| StoryTitle";
    textInfo.forEach(line => {
        if (line.includes(stringThatContainsStoryTitle)) {
            //if(newAppearing && ){
            //     allAppearings.pop();
            // }
            newAppearing = {};
            newAppearing.no = parseInt(line.substring(stringThatContainsStoryTitle.length, stringThatContainsStoryTitle.length + 2));
            newAppearing.title = line.substring(indexOfValueInLine, line.length);
        }
        if (line.includes('\'\'\'')) {
            newAppearing.focusType = line.substring(3, line.length - 5);
        }
        if (line.includes(`|[[${characterId}|`)) {
            newAppearing.typeOfAppearance = tryToGetAppearanceType(line);
            allAppearings.push(newAppearing);
            newAppearing = {};
        }
    });
    return allAppearings;
}

function tryToGetAppearanceType(line) {
    let appearanceTypeWithTwoExtraCharacters = regexForAppearanceTypeOptionOne.exec(line);
    if (!appearanceTypeWithTwoExtraCharacters) {
        appearanceTypeWithTwoExtraCharacters = regexForAppearanceTypeOptionTwo.exec(line);
    }
    if (appearanceTypeWithTwoExtraCharacters) {
        return appearanceTypeWithTwoExtraCharacters[0].substring(1, appearanceTypeWithTwoExtraCharacters[0].length - 2);
    }
    return "";
}

module.exports = IssuePageModel;