const FeedPageModel = require('./feedPageModel');
const PageDownloader = require('../pageDownloader');
const IssuePageModel = require('../issue/issuePageModel');
const IssueMassUpdateService = require('../issue/issueMassUpdateService');
const FeedPageUrl = 'https://marvel.fandom.com/wiki/Special:RecentChanges?days=1&limit=500&hidelogs=1';
const Async = require("async");
const CronJob = require("cron").CronJob;

module.exports = class {
  #dbConnection;
  #pageDownloader;
  #issueMassUpdateService;
  #oneUpdateAtATime = false;

  constructor(issueManager, dbConnection) {
    this.#dbConnection = dbConnection;
    this.#pageDownloader = new PageDownloader();
    this.#issueMassUpdateService = new IssueMassUpdateService(issueManager, dbConnection);
    new CronJob(process.env.CRON_FEED_UPDATE, () => this.initiateUpdateProcess(this), null, true);
  }

  async initiateUpdateProcess() {
    console.log(`Feed update started at ${new Date()}`);
    if (this.#oneUpdateAtATime) {
      return;
    }
    this.#oneUpdateAtATime = true;
    try {
      const feedPagePromise = this.#pageDownloader.downloadWindowFromUrlAsync(FeedPageUrl);
      const lastSavedFeedDatePromise = this.#getLastSavedFeedDateAsync();
      const feedPageModel = new FeedPageModel(await feedPagePromise, (await lastSavedFeedDatePromise).value);
      const allIssuesPageModels = await this.#downloadAllIssuesAsync(feedPageModel);
      if (await this.#issueMassUpdateService.updateIssuesAsync(allIssuesPageModels)) {
        this.#saveLastFeedDateAsync(feedPageModel.getLastUpdateTime());
      }
    } catch (error) {
      console.error(error);
    } finally {
      console.log("Feed update stopped");
      this.#oneUpdateAtATime = false;
    }
  }

  #downloadAllIssuesAsync = async function (feedPageModel) {
    const that = this;
    let no = 0;
    const issuesAndAppearances = [];

    function downloadWindowFromUrl(link, callback) {
      that.#pageDownloader.downloadWindowFromUrlAsync(`https://marvel.fandom.com${link}?action=edit`).then(
        issuePage => {
          console.log(`${++no} page downloaded! ${link}`);
          const issuePageModel = new IssuePageModel(issuePage, link);
          if (issuePageModel.isIssue) {
            issuesAndAppearances.push(issuePageModel);
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
    const allIssueLinks = feedPageModel.getAllIssueLinksSet();
    console.log(`Downloading ${allIssueLinks.size}.`);
    if (allIssueLinks.size === 0) {
      return issuesAndAppearances;
    }
    allIssueLinks.forEach(issueLink => {
      downloadingQueue.push(issueLink);
    });
    await downloadingQueue.drain();
    return issuesAndAppearances;
  }

  #getLastSavedFeedDateAsync = async function () {
    return await this.#dbConnection.findOneAsync("properties", { _id: "lastSavedFeedDate" });
  }

  #saveLastFeedDateAsync = async function (newTime) {
    return await this.#dbConnection.updateAsync("properties", { _id: "lastSavedFeedDate" }, { value: newTime });
  }

}