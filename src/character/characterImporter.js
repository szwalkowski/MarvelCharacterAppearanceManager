const CharacterModel = require('./characterModel');
const CharacterPageModel = require('./characterPageModel');
const PageDownloader = require('../pageDownloader');

let CharacterImporter = function () {
    this.pageDownloader = new PageDownloader();
};

CharacterImporter.prototype.provideCharacterBaseInfoFromPage = async function (url) {
    const wikiWindow = await this.pageDownloader.downloadWindowFromUrl(url);
    const characterPageModel = new CharacterPageModel(wikiWindow.location.origin, wikiWindow);
    return new CharacterModel(url, characterPageModel);
};

module.exports = CharacterImporter;