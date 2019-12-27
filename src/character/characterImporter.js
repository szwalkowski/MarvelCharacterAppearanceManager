const CharacterPageModel = require('./characterPageModel');
const PageDownloader = require('../pageDownloader');

let CharacterImporter = function () {
    this.pageDownloader = new PageDownloader();
};

CharacterImporter.prototype.provideCharacterBaseInfoFromPage = async function (url) {
    const wikiWindow = await this.pageDownloader.downloadWindowFromUrl(url);
    return new CharacterPageModel(wikiWindow.location.origin, wikiWindow);
};

module.exports = CharacterImporter;