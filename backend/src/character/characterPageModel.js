const JQuery = require('jquery');
const characterIdSelector = ".page-header__title";
const realNameSelector = "*[data-source='RealName'] > .pi-data-value";
const aliasesSelector = "*[data-source='Aliases'] > .pi-data-value";
const universeSelector = "*[data-source='Universe'] > .pi-data-value > a";
const imageSelector = "*[data-source='Image'] > a > img";

module.exports = class {
  #baseUrl;
  #jQuery;
  #majorAppearance;
  #minorAppearance;
  #id;

  constructor(baseUrl, characterPageWindow) {
    this.#baseUrl = baseUrl;
    this.#id = decodeURI(characterPageWindow.location.pathname.replace("/wiki/", ""));
    this.#jQuery = new JQuery(characterPageWindow);
  }

  getId() {
    return this.#id;
  };

  getRealName() {
    const realName = this.#jQuery("*[data-source='RealName'] > .pi-data-value").text();
    if (realName) {
      return realName.replace(/\[[0-9a-z ]+\]/g, "").replace(/\([0-9a-zA-Z ]+\)/g, "").trim();
    }
  };

  getCurrentAlias() {
    const currentAlias = this.#jQuery("*[data-source='CurrentAlias'] > .pi-data-value").text();
    if (currentAlias) {
      return currentAlias.replace(/\[[0-9a-z ]+\]/g, "").trim();
    }
  }

  getAliases() {
    const aliases = [];
    const currentAlias = this.getCurrentAlias();
    if (currentAlias) {
      aliases.push(currentAlias);
    }
    const otherAliases = this.#jQuery("*[data-source='Aliases'] > .pi-data-value").text();
    if (otherAliases) {
      otherAliases.split(",").forEach(alias => {
        aliases.push(alias.replace(/\[[0-9a-z ]+\]/g, "").trim());
      });
    }
    return aliases;
  };

  getUniverse() {
    return this.#findInnerHtmlAndTrimBySelector(universeSelector);
  };

  getImage() {
    const imageUrl = this.#findUrlOfImageBySelector(imageSelector);
    return imageUrl && imageUrl.substring(0, imageUrl.toLowerCase().indexOf(".jpg") + 4);
  };

  getAppearancesCount() {
    this.#findAppearances();
    return parseInt(this.#majorAppearance.innerHTML.replace(',', ''));
  };

  getMinorAppearancesCount() {
    this.#findAppearances();
    return parseInt(this.#minorAppearance.innerHTML.replace(',', ''));
  };

  getAppearancesUrl() {
    this.#findAppearances();
    return this.#baseUrl + this.#majorAppearance.attributes["href"].value;
  };

  getMinorAppearancesUrl() {
    this.#findAppearances();
    if (this.#minorAppearance.attributes["href"]) {
      return this.#baseUrl + this.#minorAppearance.attributes["href"].value;
    }
    return null;
  };

  #findAppearances = function () {
    if (this.appearances === undefined) {
      this.appearances = this.#jQuery(`li > :contains(Appearances of ${this.#findInnerHtmlAndTrimBySelector(characterIdSelector)})`);
    }
    this.#majorAppearance = this.appearances.filter((cos, el) => !el.innerHTML.includes("Minor"))[0];
    this.#minorAppearance = this.appearances.filter((cos, el) => el.innerHTML.includes("Minor"))[0];
  };

  /**
   * @return innerHtml if found
   * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
   */
  #findElementBySelector = function (selector) {
    try {
      return this.#jQuery(selector)[0];
    } catch (error) {
      console.error(`Error during finding element by ${selector}`);
      throw error;
    }
  };

  /**
   * @return innerHtml if found
   * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
   */
  #findInnerHtmlAndTrimBySelector = function (selector) {
    try {
      return this.#jQuery(selector)[0].innerHTML.trim();
    } catch (error) {
      console.error(`Error during finding element by ${selector}`);
      throw error;
    }
  };

  /**
   * @return url of element if found
   * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
   */
  #findUrlOfImageBySelector = function (selector) {
    try {
      return this.#jQuery(selector)[0].attributes["src"]["value"];
    } catch (error) {
      console.error(`Error during finding element by ${selector}`);
      throw error;
    }
  }
};