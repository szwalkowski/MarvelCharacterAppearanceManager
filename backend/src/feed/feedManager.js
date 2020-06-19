const FeedPageModel = require('./feedPageModel');
const PageDownloader = require('../pageDownloader');
const IssuePageModel = require('../issue/issuePageModel');
const Async = require("async");
const CronJob = require("cron").CronJob;

module.exports = class {
  #dbConnection;
  #pageDownloader;
  #issueMassUpdateService;
  #oneUpdateAtATime = false;

  constructor(issueManager, dbConnection, issueMassUpdateService) {
    this.#dbConnection = dbConnection;
    this.#pageDownloader = new PageDownloader();
    this.#issueMassUpdateService = issueMassUpdateService;
    new CronJob(process.env.CRON_FEED_UPDATE, () => this.initiateUpdateProcess(this), null, true);
  }

  async initiateUpdateProcess() {
    if (this.#oneUpdateAtATime) {
      return;
    }
    console.log(`Feed update started at ${new Date()}`);
    this.#oneUpdateAtATime = true;
    try {
      const lastTime = await this.#findLastTimeReadOfFeedAsync();
      const feedPagePromise = this.#pageDownloader.downloadWindowFromUrlAsync(this.#calculateLinkOfFeed(lastTime));
      const feedPageModel = new FeedPageModel(await feedPagePromise, lastTime);
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

  #findLastTimeReadOfFeedAsync = async function () {
    const lastSavedFeedDateProp = (await this.#getLastSavedFeedDateAsync());
    if (lastSavedFeedDateProp) {
      return new Date(lastSavedFeedDateProp.value);
    }
  }

  #calculateLinkOfFeed = function (lastKnownDate) {
    if (!lastKnownDate) {
      return `https://marvel.fandom.com/wiki/Special:RecentChanges?days=5&limit=5000&hidelogs=1`;
    }
    const minutesSinceLast = (new Date().getTime() - new Date(lastKnownDate).getTime()) / 1000 / 60;
    const limit = Math.max(100, parseInt(minutesSinceLast / 30) * 100);
    const days = Math.max(1, parseInt(minutesSinceLast / 60 / 20));
    return `https://marvel.fandom.com/wiki/Special:RecentChanges?days=${days}&limit=${limit}&hidelogs=1`;
  }

  #downloadAllIssuesAsync = async function (feedPageModel) {
    const that = this;
    let no = 0;
    const issuesAndAppearances = [];

    let error;

    function downloadWindowFromUrl(link, callback) {
      if (error) {
        callback();
        return;
      }
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
        console.error(`Problem downloading ${link}.`);
        console.error(reason);
        callback(reason);
      });
    }

    const downloadingQueue = Async.queue(downloadWindowFromUrl, parseInt(process.env.MCAM_MAX_DOWNLOAD_JOBS));
    const allIssueLinks = feedPageModel.getAllIssueLinksSet();
    console.log(`Downloading ${allIssueLinks.size}.`);
    if (allIssueLinks.size === 0) {
      return issuesAndAppearances;
    }
    allIssueLinks.forEach(issueLink => {
      downloadingQueue.push(issueLink);
    });
    downloadingQueue.error((err) => {
      error = err;
    });
    await downloadingQueue.drain();
    if (error) {
      throw error;
    }
    return issuesAndAppearances;
  }

  #getLastSavedFeedDateAsync = async function () {
    return await this.#dbConnection.findOneAsync("properties", { _id: "lastSavedFeedDate" });
  }

  #saveLastFeedDateAsync = async function (newTime) {
    return await this.#dbConnection.saveAsync("properties", "lastSavedFeedDate", { _id: "lastSavedFeedDate", value: newTime.toISOString() });
  }

}