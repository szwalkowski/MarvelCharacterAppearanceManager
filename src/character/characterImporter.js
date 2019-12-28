const CharacterPageModel = require('./characterPageModel');
const CharacterAppearanceWalker = require('./characterAppearanceWalker');
const PageDownloader = require('../pageDownloader');

let CharacterImporter = function () {
    this.pageDownloader = new PageDownloader();
    this.characterAppearanceWalker = new CharacterAppearanceWalker();
};

CharacterImporter.prototype.provideCharacterBaseInfoFromPageAsync = async function (url) {
    const wikiWindow = await this.pageDownloader.downloadWindowFromUrlAsync(url);
    return new CharacterPageModel(wikiWindow.location.origin, wikiWindow);
};

CharacterImporter.prototype.downloadAndStoreConfirmedCharacterAsync = async function (baseCharacterInfo) {
    const minorAppearanceWindow = this.pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.MinorAppearanceUrl);
    const appearanceWindow = this.pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.AppearanceUrl);
    const minorAppearanceLinks = this.characterAppearanceWalker.findAllLinksToIssuesAsync(await minorAppearanceWindow);
    const appearanceLinks = this.characterAppearanceWalker.findAllLinksToIssuesAsync(await appearanceWindow);

    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();


};

module.exports = CharacterImporter;