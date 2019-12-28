const JQuery = require('jquery');
const characterIdSelector = ".page-header__title";
const realNameSelector = "*[data-source='RealName'] > .pi-data-value";
const aliasesSelector = "*[data-source='Aliases'] > .pi-data-value";
const universeSelector = "*[data-source='Universe'] > .pi-data-value > a";
const imageSelector = "*[data-source='Image'] > a > img";

let CharacterPageModel = function (baseUrl, characterPageWindow) {
    this.baseUrl = baseUrl;
    this.jQuery = new JQuery(characterPageWindow);
};

CharacterPageModel.prototype.getId = function () {
    return findId(this);
};

CharacterPageModel.prototype.getRealName = function () {
    const realNameElement = findElementBySelector(this.jQuery, realNameSelector);
    if (realNameElement.children[0] && realNameElement.children[0].innerHTML.trim() !== "") {
        if (realNameElement.children[0].localName === "sup") {
            const nameWithSupLink = realNameElement.innerHTML.trim()
            return nameWithSupLink.substring(0, nameWithSupLink.indexOf('<'));
        }
        return realNameElement.children[0].innerHTML.trim();
    }
    const realNameInnerHTML = realNameElement.innerHTML.trim();
    if(realNameInnerHTML.indexOf('<') > 0){
        return realNameInnerHTML.substring(0, realNameInnerHTML.indexOf('<')).trim();
    }
    return realNameInnerHTML;
};

CharacterPageModel.prototype.getCurrentAlias = function () {
    const currentAlias = this.jQuery.find("*[data-source='CurrentAlias'] > .pi-data-value > a");
    if (currentAlias.length > 0) {
        return currentAlias[0].innerHTML.trim();
    }
    const currentAliasWithoutLink = this.jQuery.find("*[data-source='CurrentAlias'] > .pi-data-value");
    if (currentAliasWithoutLink.length > 0) {
        return currentAliasWithoutLink[0].innerHTML.trim();
    }
    const aliasesElement = findElementBySelector(this.jQuery, aliasesSelector);
    if (!aliasesElement) {
        return this.getRealName();
    }
    if (aliasesElement.children[0]) {
        return aliasesElement.children[0].innerHTML.trim();
    }
    return aliasesElement.innerHTML.trim();
};

CharacterPageModel.prototype.getUniverse = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, universeSelector);
};

CharacterPageModel.prototype.getImage = function () {
    return findUrlOfImageBySelector(this.jQuery, imageSelector);
};

CharacterPageModel.prototype.getAppearancesCount = function () {
    findAppearances(this);
    return parseInt(this.majorAppearance.innerHTML.replace(',', ''));
};

CharacterPageModel.prototype.getMinorAppearancesCount = function () {
    findAppearances(this);
    return parseInt(this.minorAppearance.innerHTML.replace(',', ''));
};

CharacterPageModel.prototype.getAppearancesUrl = function () {
    findAppearances(this);
    return this.baseUrl + this.majorAppearance.attributes["href"].value;
};

CharacterPageModel.prototype.getMinorAppearancesUrl = function () {
    findAppearances(this);
    return this.baseUrl + this.minorAppearance.attributes["href"].value;
};

function findId(model) {
    if (model.id === undefined) {
        model.id = findInnerHtmlAndTrimBySelector(model.jQuery, characterIdSelector);
    }
    return model.id;
}

function findAppearances(model) {
    if (model.appearances === undefined) {
        model.appearances = model.jQuery(`li > :contains(Appearances of ${findId(model)})`);
    }
    model.majorAppearance = model.appearances.filter((cos, el) => !el.innerHTML.includes("Minor"))[0];
    model.minorAppearance = model.appearances.filter((cos, el) => el.innerHTML.includes("Minor"))[0];
}

/**
 * @return innerHtml if found
 * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
 */
function findElementBySelector(jQuery, selector) {
    try {
        return jQuery.find(selector)[0];
    } catch (error) {
        console.error(`Error during finding element by ${selector}`);
        throw error;
    }
}

/**
 * @return innerHtml if found
 * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
 */
function findInnerHtmlAndTrimBySelector(jQuery, selector) {
    try {
        return jQuery.find(selector)[0].innerHTML.trim();
    } catch (error) {
        console.error(`Error during finding element by ${selector}`);
        throw error;
    }
}

/**
 * @return url of element if found
 * @throws "TypeError" Cannot read property 'innerHtml' of undefined if selector was not valid for page
 */
function findUrlOfImageBySelector(jQuery, selector) {
    try {
        return jQuery.find(selector)[0].attributes["src"]["value"];
    } catch (error) {
        console.error(`Error during finding element by ${selector}`);
        throw error;
    }
}

module.exports = CharacterPageModel;