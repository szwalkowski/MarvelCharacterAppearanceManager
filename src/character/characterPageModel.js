const jquery = require('jquery');
const realNameSelector = "*[data-source='RealName'] > .pi-data-value";
const currentAliasSelector = "*[data-source='CurrentAlias'] > .pi-data-value > a";
const universeSelector = "*[data-source='Universe'] > .pi-data-value > a";

let CharacterPageModel = function (characterPageWindow) {
    this.jQuery = new jquery(characterPageWindow);
};

CharacterPageModel.prototype.GetRealName = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, realNameSelector);
};

CharacterPageModel.prototype.GetCurrentAlias = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, currentAliasSelector);
};

CharacterPageModel.prototype.GetUniverse = function () {
    return findInnerHtmlAndTrimBySelector(this.jQuery, universeSelector);
};

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

module.exports = CharacterPageModel;