const JQuery = require('jquery');
const PageDownloader = require('../pageDownloader');

module.exports = class {
  #pageDownloader = new PageDownloader();

  async findAllLinksToIssuesAsync(appearanceWindow) {
    let { allLinksToIssues, nextPageOfLinks } = await this.#scanPage(appearanceWindow);
    while (nextPageOfLinks) {
      let { allLinksToIssues: linksFromOtherPage, nextPageOfLinks: nextPage } = await this.#scanPage(nextPageOfLinks);
      nextPageOfLinks = nextPage;
      allLinksToIssues.push(...linksFromOtherPage);
    }
    return allLinksToIssues;
  };

  #scanPage = async function (appearanceWindow) {
    let jQuery = new JQuery(appearanceWindow);
    const nextPageOfLinksPromise = this.#findNextPageOfLinksAsync(jQuery);
    let allLinksToIssues = this.#scanForLinks(jQuery);
    let nextPageOfLinks = await nextPageOfLinksPromise;
    return {
      allLinksToIssues,
      nextPageOfLinks
    }
  }

  #findNextPageOfLinksAsync = async function (jQuery) {
    const nextPageElement = jQuery.find('.category-page__pagination-next')[0];
    if (nextPageElement) {
      return await this.#pageDownloader.downloadWindowFromUrlAsync(nextPageElement.attributes["href"]["value"]);
    }
  };

  #scanForLinks = function (jQuery) {
    let linkCollection = [];
    const allAElementsWithLinks = jQuery.find('.category-page__member-link');
    allAElementsWithLinks.forEach(aElement => {
      linkCollection.push(aElement.attributes["href"].value);
    });
    return linkCollection;
  };
};