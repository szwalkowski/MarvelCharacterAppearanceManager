const JQuery = require('jquery');
const SelectorForLine = "table.mw-enhanced-rc";
const TimeRegex = /\d\d:\d\d/;

module.exports = class {
  #allIssueLinksSet;
  #lastUpdateTime;

  constructor(feedPageWindow, lastUpdateTime) {
    if (!feedPageWindow) {
      throw new Error("feedPageWindow is undefined!");
    }
    const jQuery = new JQuery(feedPageWindow);
    this.#allIssueLinksSet = new Set();

    for(const line of jQuery(SelectorForLine)){
      const date = jQuery(line).parent().parent().find("h4:first").text();
      const time = TimeRegex.exec(jQuery(line).find("td.mw-enhanced-rc").text())[0];
      const lineDate = new Date(`${date} ${time} UTC`);
      if (time && date && lastUpdateTime && lineDate < lastUpdateTime) {
        break;
      }
      if (!this.#lastUpdateTime) {
        this.#lastUpdateTime = lineDate;
      }
      const href = jQuery(line).find("td > a:first").attr("href");
      if (href && href.includes("_Vol_") && !/^\/wiki\/(Category|File):/.test(href)) {
        this.#allIssueLinksSet.add(href);
      }
    }
    if (!this.#lastUpdateTime) {
      throw new Error("Something wrong with update!");
    }
  }

  getAllIssueLinksSet() {
    return this.#allIssueLinksSet;
  }

  getLastUpdateTime() {
    return this.#lastUpdateTime;
  }
}