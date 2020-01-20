const JQuery = require('jquery');
const PageDownloader = require('../pageDownloader');

let CharacterAppearanceWalker = function () {
    this.pageDownloader = new PageDownloader();
};

CharacterAppearanceWalker.prototype.findAllLinksToIssuesAsync = async function (appearanceWindow) {
    const jQuery = new JQuery(appearanceWindow);
    const nextPageOfLinksPromise = findNextPageOfLinksAsync(jQuery, this.pageDownloader);
    let allLinksToIssues = scanForLinks(appearanceWindow.location.origin, jQuery);
    let nextPageOfLinks = await nextPageOfLinksPromise;
    if (nextPageOfLinks) {
        const linksFromOtherPage = await this.findAllLinksToIssuesAsync(nextPageOfLinks);
        allLinksToIssues = allLinksToIssues.concat(linksFromOtherPage);
    }
    return allLinksToIssues;
};

async function findNextPageOfLinksAsync(jQuery, pageDownloader) {
    const nextPageElement = jQuery.find('.category-page__pagination-next')[0];
    if (nextPageElement) {
        return await pageDownloader.downloadWindowFromUrlAsync(nextPageElement.attributes["href"]["value"]);
    }
}

function scanForLinks(origin, jQuery) {
    let linkCollection = [];
    const allAElementsWithLinks = jQuery.find('.category-page__member-link');
    allAElementsWithLinks.forEach(aElement => {
        linkCollection.push(origin + aElement.attributes["href"].value);
    });
    return linkCollection;
}

module.exports = CharacterAppearanceWalker;