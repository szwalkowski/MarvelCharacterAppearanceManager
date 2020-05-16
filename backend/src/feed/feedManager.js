const FeedPageModel = require('./feedPageModel');
const PageDownloader = require('../pageDownloader');
const FeedPageUrl = 'https://marvel.fandom.com/wiki/Special:RecentChanges?days=1&limit=5000&namespace=0&categories=Comics&hidelogs=1';
const Async = require("async");
const CronJob = require("cron").CronJob;

module.exports = class {
  #pageDownloader
  #oneUpdateAtATime = false

  constructor() {
    this.#pageDownloader = new PageDownloader();
    new CronJob("0 0 0,12 * * *", this.initiateUpdateProcess, null, true);
  }

  async initiateUpdateProcess() {
    if (this.#oneUpdateAtATime) {
      return;
    }
    this.#oneUpdateAtATime = true;
    try {
      const feedPage = await this.#pageDownloader.downloadWindowFromUrlAsync(FeedPageUrl);
      const feedPageModel = new FeedPageModel(feedPage);
      const allIssuesPageModels = await this.#downloadAllIssuesAsync(feedPageModel);
    } finally {
      this.#oneUpdateAtATime = false;
    }
  }

  #downloadAllIssuesAsync = async function (feedPageModel) {
    const that = this;
    let no = 0;
    function downloadWindowFromUrl(link, callback) {
      that.#pageDownloader.downloadWindowFromUrlAsync(`${link}?action=edit`).then(
        issuePage => {
          console.log(`${++no} page downloaded! ${link}`);
          //const issuePageModel = new IssuePageModel(issuePage, link);
          callback();
        }
      ).catch(reason => {
        console.error(`Problem downloading ${link}. ${reason}`);
        console.error(reason);
        throw reason;
      });
    }

    const downloadingQueue = Async.queue(downloadWindowFromUrl, 7);
    feedPageModel.getAllIssueLinksSet().forEach(issueLink => {
      downloadingQueue.push(issueLink);
    });
    await downloadingQueue.drain();
  }

}