const JQuery = require('jquery');
const PageDownloader = require('../pageDownloader');

module.exports = class {
  #pageDownloader = new PageDownloader();

  async findAllLinksToIssuesAsync(appearanceWindow) {
    const jQuery = new JQuery(appearanceWindow);
    const nextPageOfLinksPromise = this.#findNextPageOfLinksAsync(jQuery);
    let allLinksToIssues = this.#scanForLinks(appearanceWindow.location.origin, jQuery);
    let nextPageOfLinks = await nextPageOfLinksPromise;
    if (nextPageOfLinks) {
      const linksFromOtherPage = await this.findAllLinksToIssuesAsync(nextPageOfLinks);
      allLinksToIssues = allLinksToIssues.concat(linksFromOtherPage);
    }
    return allLinksToIssues;
  };

  #findNextPageOfLinksAsync = async function (jQuery) {
    const nextPageElement = jQuery.find('.category-page__pagination-next')[0];
    if (nextPageElement) {
      return await this.#pageDownloader.downloadWindowFromUrlAsync(nextPageElement.attributes["href"]["value"]);
    }
  };

  #scanForLinks = function (origin, jQuery) {
    let linkCollection = [];
    const allAElementsWithLinks = jQuery.find('.category-page__member-link');
    allAElementsWithLinks.forEach(aElement => {
      linkCollection.push(origin + aElement.attributes["href"].value);
    });
    return linkCollection;
  };
};