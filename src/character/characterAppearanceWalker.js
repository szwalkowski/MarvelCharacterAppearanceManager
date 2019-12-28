const JQuery = require('jquery');
const PageDownloader = require('../pageDownloader');

let CharacterAppearanceWalker = function () {
    this.pageDownloader = new PageDownloader();
};

CharacterAppearanceWalker.prototype.findAllLinksToIssues = async function (appearanceWindow) {
    const jQuery = new JQuery(appearanceWindow);
    let allLinksToIssues;
    const nextPageOfLinks = await findNextPageOfLinks(jQuery, this.pageDownloader);
    if (nextPageOfLinks) {
        allLinksToIssues = await this.findAllLinksToIssues(nextPageOfLinks);
    } else {
        allLinksToIssues = [];
    }
    allLinksToIssues = allLinksToIssues.concat(scanForLinks(jQuery));
    return allLinksToIssues;
};

async function findNextPageOfLinks(jQuery, pageDownloader) {
    const nextPageElement = jQuery.find('.category-page__pagination-next')[0];
    if (nextPageElement) {
        return await pageDownloader.downloadWindowFromUrl(nextPageElement.attributes["href"]["value"]);
    }
    return undefined;
}

function scanForLinks(jQuery) {
    let linkCollection = [];
    const allAElementsWithLinks = jQuery.find('.category-page__member-link');
    allAElementsWithLinks.forEach(aElement => {
        linkCollection.push(aElement.attributes["href"].value);
    });
    return linkCollection;
}

module.exports = CharacterAppearanceWalker;