const CharacterPageModel = require('./characterPageModel');
const CharacterAppearanceWalker = require('./characterAppearanceWalker');
const CharacterManager = require('./characterManager');
const IssuePageModel = require('../issue/issuePageModel');
const PageDownloader = require('../pageDownloader');

let CharacterImporter = function () {
    this.pageDownloader = new PageDownloader();
    this.characterAppearanceWalker = new CharacterAppearanceWalker();
    this.characterManager = new CharacterManager();
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
    const mergedAppearanceLinks = await mergeListsAndSort(minorAppearanceLinks, appearanceLinks);
    let no = 0;
    let promisesToFindInfoAboutAllIssues = [];
    let characterAndIssues = baseCharacterInfo;
    characterAndIssues.issues = [];
    console.log(`Downloading of ${mergedAppearanceLinks.length} issues starting!`);
    mergedAppearanceLinks.forEach(link => {
        promisesToFindInfoAboutAllIssues.push(
            this.pageDownloader.downloadWindowFromUrlAsync(`${link}?action=edit`).then(
                issuePage => {
                    console.log(`${++no} page downloaded! ${link}`);
                    const issuePageModel = new IssuePageModel(issuePage, baseCharacterInfo.CharacterId, link);
                    if (issuePageModel.isIssue) {
                        characterAndIssues.issues.push(issuePageModel);
                    }
                }
            ).catch(reason => {
                console.error(reason);
                throw reason;
            })
        );
    });
    await Promise.all(promisesToFindInfoAboutAllIssues).catch(reason => {
        console.error(reason);
        throw reason;
    });
    this.characterManager.saveCharacter(characterAndIssues);
};

async function mergeListsAndSort(minorAppearanceLinks, appearanceLinks) {
    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();
    return allAppearanceLinks;
}

module.exports = CharacterImporter;