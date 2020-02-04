const CharacterPageModel = require('./characterPageModel');
const CharacterAppearanceWalker = require('./characterAppearanceWalker');
const CharacterManager = require('./characterManager');
const IssuePageModel = require('../issue/issuePageModel');
const IssueModel = require('../issue/issueModel');
const PageDownloader = require('../pageDownloader');
const Async = require("async");

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
    const that = this;
    const minorAppearanceWindow = this.pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.MinorAppearanceUrl);
    const appearanceWindow = this.pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.AppearanceUrl);
    const minorAppearanceLinks = this.characterAppearanceWalker.findAllLinksToIssuesAsync(await minorAppearanceWindow);
    const appearanceLinks = this.characterAppearanceWalker.findAllLinksToIssuesAsync(await appearanceWindow);
    const mergedAppearanceLinks = await mergeListsAndSortAsync(minorAppearanceLinks, appearanceLinks);
    let no = 0;
    let characterAndIssues = baseCharacterInfo;
    characterAndIssues.issues = [];
    console.log(`Downloading of ${mergedAppearanceLinks.length} issues starting!`);
    function downloadWindowFromUrlAsync(link, callback){
        that.pageDownloader.downloadWindowFromUrlAsync(`${link}?action=edit`).then(
          issuePage => {
              console.log(`${++no} page downloaded! ${link}`);
              const issuePageModel = new IssuePageModel(issuePage, baseCharacterInfo.CharacterId, link);
              if (issuePageModel.isIssue) {
                  characterAndIssues.issues.push(parseIssuePageModelToIssueModel(issuePageModel));
              }
              callback();
          }
        ).catch(reason => {
            console.error(`Problem downloading ${link}. ${reason}`);
            console.error(reason);
            throw reason;
        });
    }

    let queue = Async.queue(downloadWindowFromUrlAsync, 7);

    queue.drain(() => {
        this.characterManager.saveCharacter(characterAndIssues);
        console.log("All files are uploaded");
    });

    queue.push(mergedAppearanceLinks);
};

async function mergeListsAndSortAsync(minorAppearanceLinks, appearanceLinks) {
    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();
    return allAppearanceLinks;
}

function parseIssuePageModelToIssueModel(issuePageModel) {
    const appearancesInIssue = [];
    issuePageModel.appearances.forEach(appearance => {
        appearancesInIssue.push({
            subtitle: appearance.title,
            focusType: appearance.focusType,
            appearanceTypes: appearance.typesOfAppearance
        });
    });
    return new IssueModel(issuePageModel.id, issuePageModel.url, issuePageModel.getName(), issuePageModel.getVolume(), issuePageModel.getIssueNo(),
        issuePageModel.getPublishedDate(), appearancesInIssue);
}

module.exports = CharacterImporter;