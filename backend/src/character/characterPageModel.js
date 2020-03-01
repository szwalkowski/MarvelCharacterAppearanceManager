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
    const realNameElement = this.#findElementBySelector(realNameSelector);
    if (realNameElement.children[0] && realNameElement.children[0].innerHTML.trim() !== "") {
      if (realNameElement.children[0].localName === "sup") {
        const nameWithSupLink = realNameElement.innerHTML.trim();
        return nameWithSupLink.substring(0, nameWithSupLink.indexOf('<'));
      }
      return realNameElement.children[0].innerHTML.trim();
    }
    const realNameInnerHTML = realNameElement.innerHTML.trim();
    if (realNameInnerHTML.indexOf('<') > 0) {
      return realNameInnerHTML.substring(0, realNameInnerHTML.indexOf('<')).trim();
    }
    return realNameInnerHTML;
  };

  getCurrentAlias() {
    const currentAlias = this.#jQuery.find("*[data-source='CurrentAlias'] > .pi-data-value > a");
    if (currentAlias.length > 0) {
      return currentAlias[0].innerHTML.trim();
    }
    const currentAliasWithoutLink = this.#jQuery.find("*[data-source='CurrentAlias'] > .pi-data-value");
    if (currentAliasWithoutLink.length > 0) {
      return currentAliasWithoutLink[0].innerHTML.trim();
    }
    const aliasesElement = this.#findElementBySelector(aliasesSelector);
    if (!aliasesElement) {
      return getRealName();
    }
    if (aliasesElement.children[0]) {
      return aliasesElement.children[0].innerHTML.trim();
    }
    return aliasesElement.innerHTML.trim();
  };

  getUniverse() {
    return this.#findInnerHtmlAndTrimBySelector(universeSelector);
  };

  getImage() {
    const imageUrl = this.#findUrlOfImageBySelector(imageSelector);
    return imageUrl && imageUrl.substring(0, imageUrl.indexOf(".jpg") + 4);
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
      return this.#jQuery.find(selector)[0];
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
      return this.#jQuery.find(selector)[0].innerHTML.trim();
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
      return this.#jQuery.find(selector)[0].attributes["src"]["value"];
    } catch (error) {
      console.error(`Error during finding element by ${selector}`);
      throw error;
    }
  }
};