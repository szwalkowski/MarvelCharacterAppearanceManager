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
                    new IssuePageModel(issuePage, baseCharacterInfo.characterId);
                }
            ).catch(reason => {
                console.error(reason);
            })
        );
    });
    await Promise.all(promisesToFindInfoAboutAllIssues).then(value => {
            value.forEach(issuePageModel => {
                // IT"S NOT WHAT YOU THINK IT IS //TODO
                /*

]
TypeError: Cannot read property 'getName' of undefined
    at D:\Workspace\javascript\marvel_appearance_db\src\character\characterImporter.js:38:44
    at Array.forEach (<anonymous>)
    at D:\Workspace\javascript\marvel_appearance_db\src\character\characterImporter.js:37:19
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at async CharacterImporter.downloadAndStoreConfirmedCharacterAsync (D:\Workspace\javascript\marvel_appearance_db\src\character\characterImporter.js:36:5)
                 */
                console.log(issuePageModel.getName());
                console.log(issuePageModel.getAppearances());
            });
        }
    ).catch(reason => {
        console.error(reason);
    });
    console.log(promisesToFindInfoAboutAllIssues);
};

async function mergeListsAndSort(minorAppearanceLinks, appearanceLinks) {
    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();
    return allAppearanceLinks;
}

module.exports = CharacterImporter;