const JQuery = require('jquery');
const Months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const RegexStoryTitleTag = /^\|[ ]+StoryTitle/;
const RegexAppearingTag = /^\|[ ]+Appearing/;
const RegexYearTag = /^\|[ ]+Year/;
const RegexMonthTag = /^\|[ ]+Month/;
const RegexImageTag = /^\|[ ]+Image /;
const RegexForAppearanceTypeOptionOne = /[{\\|][a-zA-Z\d ']+}}/g;
const RegexForAppearanceTypeOptionTwo = /{[a-zA-Z\d ']+\|/g;
const InvalidTypeAppearances = ["A", "APN", "G", "CHRONOLOGY", "CHRONOFB"];

module.exports = class {
  #jquery;

  constructor(issuePageWindow, characterId, url) {
    if (!issuePageWindow) {
      throw new Error("issuePageWindow is undefined!");
    }
    if (!characterId) {
      throw new Error("characterId is undefined!");
    }
    this.url = url;
    this.#jquery = new JQuery(issuePageWindow);
    const allIssueDataElement = this.#jquery.find(SelectorWithAllIssueData)[0];
    if (allIssueDataElement) {
      this.id = decodeURI(issuePageWindow.window.document.location.pathname.replace("/wiki/", ""));
      let issueTextInfo = allIssueDataElement.innerHTML.split("\n");
      this.isIssue = issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
      if (this.isIssue) {
        this.fullName = this.#jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
        this.#readDataFromText(issueTextInfo, characterId.replace(/_/g, " "));
      }
    } else {
      this.isIssue = false;
    }
  };

  getName() {
    return this.fullName.split(" Vol ")[0];
  };

  getVolume() {
    const separatedWords = this.fullName.split(" ");
    return parseInt(separatedWords[separatedWords.indexOf("Vol") + 1]);
  };

  getIssueNo() {
    return this.fullName.split(/ Vol [0-9]+ /)[1];
  };

  getPublishedDate() {
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

  getAppearances() {
    return this.appearances;
  };

  getImage() {
    if (this.image) {
      return encodeURI(this.image.replace(/ /g, "_"));
    }
    return encodeURI(`${this.id}.jpg`);
  };

  #readDataFromText = function (issueTextInfo, characterId) {
    let allAppearings = [];
    let appearingNumber = -1;
    let foundFocusType = false;
    const regexForCharacter = new RegExp(`^:*\\*.*{{.*${this.#escapeRegExp(characterId)}.*\\|.*`);
    for (let counter = 0; counter < issueTextInfo.length; counter++) {
      const line = issueTextInfo[counter].trim();
      if (appearingNumber > -1 && line.startsWith("| ")) {
        appearingNumber = -1;
        foundFocusType = false;
      } else if (appearingNumber > -1) {
        if (line.startsWith("'''") && line.endsWith("'''")) {
          this.#resolveFocusType(allAppearings, appearingNumber, line);
          foundFocusType = true;
        } else if (foundFocusType) {
          if (regexForCharacter.exec(line)) {
            this.#addAppearingTypes(this.#prepareAppearing(allAppearings, appearingNumber), line);
            foundFocusType = false;
            appearingNumber = -1;
          }
        }
      }
      if (RegexStoryTitleTag.exec(line)) {
        this.#resolveStoryTitleAndOrdinal(allAppearings, line);
      } else if (RegexAppearingTag.exec(line)) {
        appearingNumber = this.#getOrdinalOfAppearing(line, RegexAppearingTag);
      } else if (RegexYearTag.exec(line)) {
        this.year = this.#getValueAfterEqualsSign(line);
      } else if (RegexMonthTag.exec(line)) {
        this.month = this.#getValueAfterEqualsSign(line);
      } else if (RegexImageTag.exec(line)) {
        this.image = this.#getValueAfterEqualsSign(line);
      }
    }
    allAppearings = this.#cleanupEmptyAppearings(allAppearings);
    this.appearances = allAppearings;
  };

  #resolveStoryTitleAndOrdinal = function (allAppearings, line) {
    const ordinal = this.#getOrdinalOfAppearing(line, RegexStoryTitleTag);
    const appearing = this.#prepareAppearing(allAppearings, ordinal);
    appearing.title = this.#getValueAfterEqualsSign(line);
  };

  #resolveFocusType = function (allAppearings, ordinal, line) {
    const appearing = this.#prepareAppearing(allAppearings, ordinal);
    appearing.focusType = line.substring(3, line.length - 4).trim();
  };

  #prepareAppearing = function (allAppearings, idx) {
    let appearing = allAppearings.find(appearing => appearing.id === idx);
    if (!appearing) {
      appearing = { id: idx };
      allAppearings.push(appearing);
    }
    return appearing;
  };

  #getOrdinalOfAppearing = function (line, regexp) {
    return parseInt(line.split(regexp)[1]);
  };

  #getValueAfterEqualsSign = function (line) {
    return line.substring(line.indexOf("=") + 1).trim();
  };

  #cleanupEmptyAppearings = function (allAppearings) {
    return allAppearings.filter(appearing => appearing.typesOfAppearance);
  };

  #escapeRegExp = function (s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  };

  #addAppearingTypes = function (appearing, line) {
    const appearanceTypes = [];
    let regexResolution = line.match(RegexForAppearanceTypeOptionOne);
    if (regexResolution) {
      regexResolution.forEach(type => {
        const appearanceType = type.substring(1, type.length - 2).trim();
        this.#addToAppearancesIfValidType(appearanceTypes, appearanceType);
      });
    }
    regexResolution = line.match(RegexForAppearanceTypeOptionTwo);
    if (regexResolution) {
      regexResolution.forEach(type => {
        const appearanceType = type.substring(1, type.length - 1).trim();
        this.#addToAppearancesIfValidType(appearanceTypes, appearanceType);
      });
    }
    appearing.typesOfAppearance = appearanceTypes;
  };

  #addToAppearancesIfValidType = function (appearanceTypes, appearanceType) {
    if (this.#isValidTypeAppearance(appearanceType)) {
      appearanceTypes.push(appearanceType);
    }
  };

  #isValidTypeAppearance = function (typeAppearance) {
    return typeAppearance &&
      InvalidTypeAppearances.findIndex(type => type === typeAppearance.toUpperCase()) < 0 &&
      !typeAppearance.includes(" Vol ");
  };
};