const CharacterPageModel = require('./characterPageModel');
const CharacterAppearanceWalker = require('./characterAppearanceWalker');
const IssuePageModel = require('../issue/issuePageModel');
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
    const mergedAppearanceLinks = await mergeListsAndSort(minorAppearanceLinks, appearanceLinks);
    let no = 0;
    let promisesToFindInfoAboutAllIssues = [];
    mergedAppearanceLinks.forEach(link => {
        promisesToFindInfoAboutAllIssues.push(
            this.pageDownloader.downloadWindowFromUrlAsync(`${link}?action=edit`).then(
                issuePage => {
                    console.log(`${++no} page downloaded! ${link}`);
                    const issuePageModel = new IssuePageModel(issuePage, baseCharacterInfo.CharacterId);
                    if (issuePageModel.isIssue) {
                        console.log(`${issuePageModel.getName()} ${issuePageModel.getVolume()} ${issuePageModel.getIssueNo()} ${new Date(issuePageModel.getPublishedDate())}`);
                        console.log(issuePageModel.getAppearances());
                    }
                }
            ).catch(reason => {
                console.error(reason);
            })
        );
    });
    await Promise.all(promisesToFindInfoAboutAllIssues).then(value => {
        console.log("All promises ended!");
    }).catch(reason => {
        console.error(reason);
    });
};

async function mergeListsAndSort(minorAppearanceLinks, appearanceLinks) {
    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();
    return allAppearanceLinks;
}

module.exports = CharacterImporter;