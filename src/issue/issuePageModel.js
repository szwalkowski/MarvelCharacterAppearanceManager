const JQuery = require('jquery');
const Months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const regexForAppearanceTypeOptionOne = /[\{\|][a-zA-Z\d]+}}/g;
const regexForAppearanceTypeOptionTwo = /{[a-zA-Z\d]+\|/;
const regexFocusType = /^'''[a-zA-Z ]+:'''$/;
const invalidTypeAppearances = ["A", "APN", "G", "CHRONOLOGY", "CHRONOFB"];

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
    const allIssueDataElement = this.jquery.find(SelectorWithAllIssueData)[0];
    if (allIssueDataElement) {
        this.issueTextInfo = allIssueDataElement.innerHTML.split("\n");
        this.isIssue = this.issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
        if (this.isIssue) {
            this.fullName = this.jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
            this.indexOfValueInLine = this.issueTextInfo.find(value => value.includes(" Year ")).indexOf("=") + 2;
            this.appearances = prepareAppearanceInfo(this.issueTextInfo, this.indexOfValueInLine, this.characterId);
        }
    } else {
        this.isIssue = false;
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
            const monthName = monthLine.substring(this.indexOfValueInLine, monthLine.length).toUpperCase();
            month = Months.findIndex(value => value === monthName);
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
    let weHaveStory = false;
    let appearingsStarted = false;
    for(let counter = 0; counter < textInfo.length; counter++) {
        const line = textInfo[counter];
        if (!appearingsStarted && line.includes(stringThatContainsStoryTitle)) {
            newAppearing = {};
            newAppearing.no = parseInt(line.substring(stringThatContainsStoryTitle.length, stringThatContainsStoryTitle.length + 2));
            newAppearing.title = line.substring(indexOfValueInLine, line.length);
            weHaveStory = true;
        }
        if (!appearingsStarted && line.includes("Appearing")) {
            appearingsStarted = true;
        }
        if (weHaveStory || appearingsStarted) {
            if (line.startsWith("{{Quote")) {
                // continue
            } else if (regexFocusType.exec(line)) {
                newAppearing.focusType = line.substring(3, line.length - 5);
            } else if (line.includes(`|[[${characterId}|`) || line.startsWith(`** {{Minor|${characterId}|`)) {
                newAppearing.typesOfAppearance = tryToGetAppearanceType(line);
                allAppearings.push(newAppearing);
                newAppearing = {};
                weHaveStory = appearingsStarted = false;
            } else if (appearingsStarted && line === "" && (!textInfo[counter + 1] || !textInfo[counter + 1].startsWith("'''"))) {
                newAppearing = {};
                weHaveStory = appearingsStarted = false;
            }
        }
    }
    return allAppearings;
}

function tryToGetAppearanceType(line) {
    let appearanceTypes = [];
    let regexResolution = line.match(regexForAppearanceTypeOptionOne);
    if (regexResolution) {
        regexResolution.forEach(type => {
            let appearanceType = type.substring(1, type.length - 2);
            if (isValidTypeAppearance(appearanceType)) {
                appearanceTypes.push(appearanceType);
            }
        });
    }
    regexResolution = regexForAppearanceTypeOptionTwo.exec(line);
    if (regexResolution) {
        let appearanceType = regexResolution[0].substring(1, regexResolution[0].length - 1);
        if (isValidTypeAppearance(appearanceType)) {
            appearanceTypes.push(appearanceType);
        }
    }
    return appearanceTypes;
}

function isValidTypeAppearance(typeAppearance) {
    return invalidTypeAppearances.findIndex(type => type === typeAppearance.toUpperCase()) < 0;
}

module.exports = IssuePageModel;