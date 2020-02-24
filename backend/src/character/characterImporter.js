const CharacterPageModel = require('./characterPageModel');
const CharacterAppearanceWalker = require('./characterAppearanceWalker');
const CharacterManager = require('./characterManager');
const IssuePageModel = require('../issue/issuePageModel');
const IssueModel = require('../issue/issueModel');
const PageDownloader = require('../pageDownloader');
const Async = require("async");

module.exports = class {
  #pageDownloader = new PageDownloader();
  #characterAppearanceWalker = new CharacterAppearanceWalker();
  #characterManager;
  #issueManager;

  constructor(issueManager, dbConnection) {
    this.#characterManager = new CharacterManager(dbConnection);
    this.#issueManager = issueManager;
  }

  async provideCharacterBaseInfoFromPageAsync(url) {
    const wikiWindow = await this.#pageDownloader.downloadWindowFromUrlAsync(url);
    return new CharacterPageModel(wikiWindow.location.origin, wikiWindow);
  };

  async downloadAndStoreConfirmedCharacterAsync(baseCharacterInfo) {
    const that = this;
    let minorAppearanceLinks = [];
    if (baseCharacterInfo.MinorAppearanceUrl) {
      const minorAppearanceWindow = this.#pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.MinorAppearanceUrl);
      minorAppearanceLinks = this.#characterAppearanceWalker.findAllLinksToIssuesAsync(await minorAppearanceWindow);
    }
    const appearanceWindow = this.#pageDownloader.downloadWindowFromUrlAsync(baseCharacterInfo.AppearanceUrl);
    const appearanceLinks = this.#characterAppearanceWalker.findAllLinksToIssuesAsync(await appearanceWindow);
    const mergedAppearanceLinks = await that.#mergeListsAndSortAsync(minorAppearanceLinks, appearanceLinks);
    let no = 0;
    let characterAndIssues = baseCharacterInfo;
    characterAndIssues.issues = [];
    console.log(`Downloading of ${mergedAppearanceLinks.length} issues starting!`);

    function downloadWindowFromUrl(link, callback) {
      that.#pageDownloader.downloadWindowFromUrlAsync(`${link}?action=edit`).then(
        issuePage => {
          console.log(`${++no} page downloaded! ${link}`);
          const issuePageModel = new IssuePageModel(issuePage, baseCharacterInfo.CharacterId, link);
          if (issuePageModel.isIssue) {
            characterAndIssues.issues.push(that.#parseIssuePageModelToIssueModel(issuePageModel));
          }
          callback();
        }
      ).catch(reason => {
        console.error(`Problem downloading ${link}. ${reason}`);
        console.error(reason);
        throw reason;
      });
    }

    const downloadingQueue = Async.queue(downloadWindowFromUrl, 7);
    downloadingQueue.drain(() => this.#saveCharacterToFile(characterAndIssues));
    downloadingQueue.push(mergedAppearanceLinks);
  };

  #saveCharacterToFile = function (characterAndIssues) {
    const saveCharacterPromise = this.#characterManager.saveCharacterAsync(characterAndIssues);
    const issueUpdatesPromises = [];
    characterAndIssues.issues.forEach(issue => {
      issueUpdatesPromises.push(this.#issueManager.addAppearanceToIssue(issue, characterAndIssues));
    });
    Promise.all([saveCharacterPromise, ...issueUpdatesPromises])
      .then(() => {
        console.log("All files are uploaded and saved");
      })
      .catch(err => {
        console.error("Something went wrong with storing character. Investigate and retry!", err);
      });
  };

  #mergeListsAndSortAsync = async function (minorAppearanceLinks, appearanceLinks) {
    const allAppearanceLinks = (await minorAppearanceLinks).concat(await appearanceLinks);
    allAppearanceLinks.sort();
    return allAppearanceLinks;
  };

  #parseIssuePageModelToIssueModel = function (issuePageModel) {
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
};