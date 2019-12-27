const jquery = require('jquery');
const characterIdSelector = ".page-header__title";
const realNameSelector = "*[data-source='RealName'] > .pi-data-value";
const currentAliasSelector = "*[data-source='CurrentAlias'] > .pi-data-value > a";
const universeSelector = "*[data-source='Universe'] > .pi-data-value > a";
const imageSelector = "*[data-source='Image'] > a > img";

let CharacterPageModel = function (baseUrl, characterPageWindow) {
    this.baseUrl = baseUrl;
    this.jQuery = new jquery(characterPageWindow);
};

CharacterPageModel.prototype.getId = function () {
    return findId(this);
};

CharacterPageModel.prototype.getRealName = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, realNameSelector);
};

CharacterPageModel.prototype.getCurrentAlias = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, currentAliasSelector);
};

CharacterPageModel.prototype.getUniverse = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, universeSelector);
};

CharacterPageModel.prototype.getImage = function () {
    return findUrlOfImageBySelector(this.jQuery, imageSelector);
};

CharacterPageModel.prototype.getAppearancesCount = function () {
    findAppearances(this);
    return parseInt(this.majorAppearance.innerHTML);
};

CharacterPageModel.prototype.getMinorAppearancesCount = function () {
    findAppearances(this);
    return parseInt(this.minorAppearance.innerHTML);
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