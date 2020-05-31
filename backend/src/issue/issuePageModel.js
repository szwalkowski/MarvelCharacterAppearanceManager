const JQuery = require('jquery');
const AppearingResolver = require('./appearingResolver');
const Months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SelectorForPageHeaderAndTitleThere = '#EditPageHeader h1 a';
const SelectorWithAllIssueData = '#wpTextbox1';
const RegexStoryTitleTag = /^\|[ ]+StoryTitle/;
const RegexAppearingTag = /^\|[ ]+Appearing/;
const RegexYearTag = /^\|[ ]+Year/;
const RegexMonthTag = /^\|[ ]+Month/;
const RegexImageTag = /^\|[ ]+Image /;

module.exports = class {
  #appearingResolver;
  #appearingCharacters;

  constructor(issuePageWindow, url) {
    if (!issuePageWindow) {
      throw new Error("issuePageWindow is undefined!");
    }
    this.#appearingCharacters = new Set();
    this.url = url;
    this.#appearingResolver = new AppearingResolver();
    const jquery = new JQuery(issuePageWindow);
    const allIssueDataElement = jquery.find(SelectorWithAllIssueData)[0];
    if (allIssueDataElement) {
      this.id = decodeURI(issuePageWindow.window.document.location.pathname.replace("/wiki/", ""));
      let issueTextInfo = allIssueDataElement.innerHTML.split("\n");
      this.isIssue = issueTextInfo.findIndex(value => value.includes("Marvel Database:Comic Template")) > -1;
      if (this.isIssue) {
        this.fullName = jquery.find(SelectorForPageHeaderAndTitleThere)[0].innerHTML;
        this.#readDataFromText(issueTextInfo);
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
    const volIndex = separatedWords.indexOf("Vol");
    if (volIndex < 0) {
      return null;
    }
    return parseInt(separatedWords[volIndex + 1]);
  };

  getIssueNo() {
    const titleAndIssueNumber = this.fullName.split(/ Vol [0-9]+ /);
    if (titleAndIssueNumber.length === 1) {
      return null;
    }
    return titleAndIssueNumber[1];
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

  getAppearances(characterId) {
    const appearances = [];
    for (const issueStory in this.issueStories) {
      if (!this.issueStories.hasOwnProperty(issueStory)) {
        continue;
      }
      let appearance = { storyOrdinal: issueStory };
      let title;
      for (const storyElement in this.issueStories[issueStory]) {
        if (!this.issueStories[issueStory].hasOwnProperty(storyElement)) {
          continue;
        }
        if (storyElement === "title") {
          appearance.title = this.issueStories[issueStory][storyElement];
          title = appearance.title;
        } else {
          const appearanceOfCharacter = this.issueStories[issueStory][storyElement].filter(app => app.id === characterId);
          for (const appearing in appearanceOfCharacter) {
            appearance.focusType = storyElement;
            appearance.typesOfAppearance = appearanceOfCharacter[appearing].tags;
            if (this.#isSameAppearanceNotIncluded(appearances, appearance)) {
              appearances.push(appearance);
            }
            appearance = { storyOrdinal: issueStory, title };
          }
        }
      }
    }
    return appearances;
  };

  getImage() {
    if (this.image) {
      return encodeURI(this.image.replace(/ /g, "_"));
    }
    return encodeURI(`${this.id}.jpg`);
  };

  getAllAppearingIds() {
    return this.#appearingCharacters;
  }

  #isSameAppearanceNotIncluded = function (appearances, newAppearance) {
    return !appearances.length || !appearances.find(appearance => {
      if (appearance.storyOrdinal !== newAppearance.storyOrdinal || appearance.focusType !== newAppearance.focusType) {
        return false;
      }
      if (!appearance.typesOfAppearance.length && !newAppearance.typesOfAppearance.length) {
        return true;
      }
      for(const tag of appearance.typesOfAppearance) {
        if (newAppearance.typesOfAppearance.includes(tag)) {
          return true;
        }
      }
      return false;
    });
  }

  #readDataFromText = function (issueTextInfo) {
    const issueStories = {};
    let appearingNumber = null;
    let lastFocusType = null;
    for (let counter = 0; counter < issueTextInfo.length; counter++) {
      const line = issueTextInfo[counter].trim();
      if (!line) {
        continue;
      }
      if (appearingNumber !== null && !line.startsWith("| ")) {
        if (line.startsWith("'''") && line.endsWith("'''")) {
          lastFocusType = this.#resolveFocusType(line, issueStories[appearingNumber]);
        } else if (lastFocusType !== null && (line.startsWith("*") || line.startsWith(":*"))) {
          const appearance = this.#appearingResolver.resolveAppearing(line);
          appearance.forEach(app => this.#appearingCharacters.add(app.id));
          if (appearance.length) {
            issueStories[appearingNumber][lastFocusType].push(...appearance);
          }
        }
      } else if (RegexYearTag.test(line)) {
        appearingNumber = null;
        lastFocusType = null;
        this.year = this.#getValueAfterEqualsSign(line);
      } else if (RegexMonthTag.test(line)) {
        appearingNumber = null;
        lastFocusType = null;
        this.month = this.#getValueAfterEqualsSign(line);
      } else if (RegexImageTag.test(line)) {
        appearingNumber = null;
        lastFocusType = null;
        this.image = this.#getValueAfterEqualsSign(line);
      } else if (RegexStoryTitleTag.test(line)) {
        appearingNumber = null;
        lastFocusType = null;
        this.#addIssueTo(issueStories, line);
      } else if (RegexAppearingTag.test(line)) {
        lastFocusType = null;
        appearingNumber = this.#resolveOrdinal(line, RegexAppearingTag);
        if (!issueStories[appearingNumber]) {
          issueStories[appearingNumber] = {};
        }
      } else if (line.startsWith("| ")) {
        appearingNumber = null;
        lastFocusType = null;
      } else if (lastFocusType !== null) {
        throw new Error(`Found focus type ${lastFocusType} but there no appearing!`);
      }
    }
    this.issueStories = issueStories;
  };

  #addIssueTo = function (issueStories, line) {
    const title = this.#getValueAfterEqualsSign(line);
    const story = this.#provideStoryByOrdinal(issueStories, line, RegexStoryTitleTag);
    story.title = title;
  };

  #provideStoryByOrdinal = function (issueStories, line, regex) {
    const ordinal = this.#resolveOrdinal(line, regex);
    if (!issueStories[ordinal]) {
      issueStories[ordinal] = {};
    }
    return issueStories[ordinal];
  }

  #resolveOrdinal = function (line, regex) {
    return parseInt(line.split(regex)[1]) || "";
  }

  #resolveFocusType = function (line, story) {
    const focusType = line.substring(3, line.length - 4).trim();
    story[focusType] = [];
    return focusType;
  };

  #getValueAfterEqualsSign = function (line) {
    return line.substring(line.indexOf("=") + 1).trim();
  };
};