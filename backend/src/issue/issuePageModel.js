const JQuery = require('jquery');
const Months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const RegexStoryTitleTag = /^\|[ ]+StoryTitle/;
const RegexAppearingTag = /^\|[ ]+Appearing/;
const RegexYearTag = /^\|[ ]+Year/;
const RegexMonthTag = /^\|[ ]+Month/;
const RegexForAppearanceTypeOptionOne = /[{\\|][a-zA-Z\d ']+}}/g;
const RegexForAppearanceTypeOptionTwo = /{[a-zA-Z\d ']+\|/;
const InvalidTypeAppearances = ["A", "APN", "G", "CHRONOLOGY", "CHRONOFB"];

let IssuePageModel = function (issuePageWindow, characterId, url) {
    if (!issuePageWindow) {
        throw new Error("issuePageWindow is undefined!");
    }
    if (!characterId) {
        throw new Error("characterId is undefined!");
    }
    this.url = url;
    this.jquery = new JQuery(issuePageWindow);
    const allIssueDataElement = this.jquery.find(SelectorWithAllIssueData)[0];
    if (allIssueDataElement) {
        this.id = issuePageWindow.window.document.location.pathname;
        let issueTextInfo = allIssueDataElement.innerHTML.split("\n");
        this.isIssue = issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
        if (this.isIssue) {
            this.fullName = this.jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
            readDataFromText(this, issueTextInfo, characterId);
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
    const year = parseInt(this.year);
    let month = this.month;
    if (month) {
        month = parseInt(month);
        if (!month) {
            const monthName = this.month.toUpperCase();
            month = Months.findIndex(value => value === monthName);
        } else {
            month--;
        }
    } else {
        month = 0;
    }
    return new Date(year, month).getTime();
};

IssuePageModel.prototype.getAppearances = function () {
    return this.appearances;
};

function readDataFromText(pageModel, issueTextInfo, characterId) {
    let allAppearings = [];
    let appearingNumber = -1;
    let foundFocusType = false;
    const regexForCharacter = new RegExp(`^:*\\*.*{{.*${escapeRegExp(characterId)}.*\\|.*`);
    for(let counter = 0; counter < issueTextInfo.length; counter++) {
        const line = issueTextInfo[counter].trim();
        if (appearingNumber > -1 && line.startsWith("| ")) {
            appearingNumber = -1;
            foundFocusType = false;
        } else if (appearingNumber > -1) {
            if (line.startsWith("'''") && line.endsWith("'''")) {
                resolveAppearingType(allAppearings, appearingNumber, line);
                foundFocusType = true;
            } else if (foundFocusType) {
                if (regexForCharacter.exec(line)) {
                    addAppearingTypes(prepareAppearing(allAppearings, appearingNumber), line);
                    foundFocusType = false;
                    appearingNumber = -1;
                }
            }
        }
        if (RegexStoryTitleTag.exec(line)) {
            resolveStoryTitleAndOrdinal(allAppearings, line);
        } else if (RegexAppearingTag.exec(line)) {
            appearingNumber = getOrdinalOfAppearing(line, RegexAppearingTag);
        } else if (RegexYearTag.exec(line)) {
            pageModel.year = getValueAfterEqualsSign(line);
        } else if (RegexMonthTag.exec(line)) {
            pageModel.month = getValueAfterEqualsSign(line);
        }
    }
    allAppearings = cleanupEmptyAppearings(allAppearings);
    pageModel.appearances = allAppearings;
}

function resolveStoryTitleAndOrdinal(allAppearings, line) {
    const ordinal = getOrdinalOfAppearing(line, RegexStoryTitleTag);
    const appearing = prepareAppearing(allAppearings, ordinal);
    appearing.title = getValueAfterEqualsSign(line);
}

function resolveAppearingType(allAppearings, ordinal, line) {
    const appearing = prepareAppearing(allAppearings, ordinal);
    appearing.focusType = line.substring(3, line.length - 5);
}

function prepareAppearing(allAppearings, idx) {
    let appearing = allAppearings.find(appearing => appearing.id === idx);
    if (!appearing) {
        appearing = {id: idx};
        allAppearings.push(appearing);
    }
    return appearing;
}

function getOrdinalOfAppearing(line, regexp) {
    return parseInt(line.split(regexp)[1]);
}

function getValueAfterEqualsSign(line) {
    return line.substring(line.indexOf("=") + 1).trim();
}

function cleanupEmptyAppearings(allAppearings) {
    return allAppearings.filter(appearing => appearing.typesOfAppearance);
}

function escapeRegExp(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function addAppearingTypes(appearing, line) {
    const appearanceTypes = [];
    let regexResolution = line.match(RegexForAppearanceTypeOptionOne);
    if (regexResolution) {
        regexResolution.forEach(type => {
            const appearanceType = type.substring(1, type.length - 2).trim();
            if (isValidTypeAppearance(appearanceType)) {
                appearanceTypes.push(appearanceType);
            }
        });
    }
    regexResolution = RegexForAppearanceTypeOptionTwo.exec(line);
    if (regexResolution) {
        const appearanceType = regexResolution[0].substring(1, regexResolution[0].length - 1).trim();
        if (isValidTypeAppearance(appearanceType)) {
            appearanceTypes.push(appearanceType);
        }
    }
    appearing.typesOfAppearance = appearanceTypes;
}

function isValidTypeAppearance(typeAppearance) {
    return typeAppearance &&
      InvalidTypeAppearances.findIndex(type => type === typeAppearance.toUpperCase()) < 0 &&
      !typeAppearance.includes(" Vol ");
}

module.exports = IssuePageModel;