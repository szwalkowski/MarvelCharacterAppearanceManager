const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const jquery = require('jquery');
const CharacterModel = require('./characterModel');

let CharacterImporter = function () {
};

CharacterImporter.prototype.downloadMainPageOfCharacterWindow = async function (url) {
    let dom = await JSDOM.fromURL(url);
    return dom.window;
};

module.exports = CharacterImporter;