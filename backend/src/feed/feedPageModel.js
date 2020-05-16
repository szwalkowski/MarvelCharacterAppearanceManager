const JQuery = require('jquery');
const SelectorForVolumeLinks = '[class*=_Vol_] a[title*=\' Vol \']:contains(\' Vol \')';

module.exports = class {
  #jquery;
  #allIssueLinksSet;

  constructor(feedPageWindow) {
    if (!feedPageWindow) {
      throw new Error("feedPageWindow is undefined!");
    }
    this.#jquery = new JQuery(feedPageWindow);
    this.#allIssueLinksSet = new Set();
    this.#jquery.find(SelectorForVolumeLinks).forEach(volumeLink => {
      if (!volumeLink["href"]) {
        console.log(volumeLink);
      }
      this.#allIssueLinksSet.add(volumeLink["href"]);
    });
  }

  getAllIssueLinksSet() {
    return this.#allIssueLinksSet;
  }
}