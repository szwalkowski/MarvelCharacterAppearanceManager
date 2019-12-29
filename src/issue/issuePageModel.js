const JQuery = require('jquery');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const containsComicsCategorySelector = ".page-header__categories-links > :contains('Comics')";
const imageSelector = "#templateimage .image-thumbnail > img";

let IssuePageModel = function (issuePageWindow, characterUrl) {
    this.characterUrl = characterUrl;
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
        const elementWithImage = this.jQuery.find(imageSelector)[0];
        if (elementWithImage.attributes["data-src"]) {
            return elementWithImage.attributes["data-src"]["value"];
        }
        return elementWithImage.attributes["src"]["value"];
    } catch (error) {
        console.error(`Error during finding element by ${imageSelector}`);
        throw error;
    }
};

IssuePageModel.prototype.getPublishedDate = function () {
    const year = this.keywords.find(value => new RegExp("^\\d{4}$").test(value));
    const month = this.keywords.find(value => months.includes(value));
    return new Date(year, months.findIndex(value => value === month)).getTime();
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

function resolveAppearances(jQuery, characterUrl) {
    for (let i = 0; i < 10; i++) {
        const startingHeader = jQuery.find(`#AppearingHeader${i}`)[0];
        if (startingHeader) {
            return findNextSiblingWithDesiredCharacter(startingHeader, characterUrl);
        }
    }
}

function findNextSiblingWithDesiredCharacter(elementToStartFrom, characterUrl) {
    const nextElementSibling = elementToStartFrom.nextElementSibling;
    if (!nextElementSibling) {
        return undefined;
    } else if (nextElementSibling.innerHTML.includes(characterUrl)) {
        const spanElement = nextElementSibling.innerHTML;
        return spanElement.substring();
    }
    return findNextSiblingWithDesiredCharacter(nextElementSibling, characterUrl);
}

module.exports = IssuePageModel;