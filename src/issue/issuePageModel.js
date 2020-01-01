const JQuery = require('jquery');
const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const regexForAppearanceTypeOptionOne = /\{[a-zA-Z\d]+}}$/;
const regexForAppearanceTypeOptionTwo = /\|[a-zA-Z\d]+}}$/;
const regexForAppearanceTypeOptionThree = /{[a-zA-Z\d]+\|/;
const regexFocusType = /^'''[a-zA-Z ]+:'''$/;

let IssuePageModel = function (issuePageWindow, characterId, url) {
    if (!issuePageWindow) {
        throw new Error("issuePageWindow is undefined!");
    }
    if (!characterId) {
        throw new Error("characterId is undefined!");
    }
    this.url = url;
    this.characterId = characterId;
    this.jquery = new JQuery(issuePageWindow);
    this.fullName = this.jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
    this.issueTextInfo = this.jquery.find(SelectorWithAllIssueData)[0].innerHTML.split("\n");
    this.isIssue = this.issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
    if (this.isIssue) {
        this.indexOfValueInLine = this.issueTextInfo.find(value => value.includes(" Year ")).indexOf("=") + 2;
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
    const yearLine = this.issueTextInfo.find(line => line.includes("| Year"));
    const year = parseInt(yearLine.substring(this.indexOfValueInLine, this.indexOfValueInLine + 4));
    const monthLine = this.issueTextInfo.find(line => line.includes("| Month"));
    let month;
    if (monthLine) {
        month = parseInt(monthLine.substring(this.indexOfValueInLine, this.indexOfValueInLine + 2));
        if (!month) {
            month = Months.findIndex(value => value === monthLine.substring(this.indexOfValueInLine, monthLine.length - 1));
        }
    } else {
        month = Months.findIndex(value => value === "January");
    }
    return new Date(year, month - 1).getTime();
};

IssuePageModel.prototype.getAppearances = function () {
    return this.appearances;
};

function prepareAppearanceInfo(textInfo, indexOfValueInLine, characterId) {
    let allAppearings = [];
    let newAppearing = {};
    const stringThatContainsStoryTitle = "| StoryTitle";
    textInfo.forEach(line => {
        if (line.includes(stringThatContainsStoryTitle)) {
            newAppearing = {};
            newAppearing.no = parseInt(line.substring(stringThatContainsStoryTitle.length, stringThatContainsStoryTitle.length + 2));
            newAppearing.title = line.substring(indexOfValueInLine, line.length);
        }
        if (regexFocusType.exec(line)) {
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
    let appearanceType = regexForAppearanceTypeOptionOne.exec(line);
    if (!appearanceType) {
        appearanceType = regexForAppearanceTypeOptionTwo.exec(line);
    }
    if (appearanceType) {
        return appearanceType[0].substring(1, appearanceType[0].length - 2);
    }
    appearanceType = regexForAppearanceTypeOptionThree.exec(line);
    if (appearanceType) {
        appearanceType = appearanceType[0].substring(1, appearanceType[0].length - 1);
        if (appearanceType === "a" || appearanceType === "apn") {
            return "";
        }
        return appearanceType;
    }
    return "";
}

// * {{OnScreen|[[Aleksei Sytsevich (Earth-616)|Rhino (Aleksei Sytsevich)]]}}
module.exports = IssuePageModel;