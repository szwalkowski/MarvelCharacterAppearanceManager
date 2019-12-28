const JQuery = require('jquery');
const PageDownloader = require('../pageDownloader');

let CharacterAppearanceWalker = function () {
    this.pageDownloader = new PageDownloader();
};

CharacterAppearanceWalker.prototype.findAllLinksToIssues = function (appearanceWindow) {
    let jQuery = new JQuery(appearanceWindow);
    let allLinksToIssues;
    const nextPageOfLinks = findNextPageOfLinks(jQuery, this.pageDownloader);
    if (nextPageOfLinks) {
        allLinksToIssues = this.findAllLinksToIssues(nextPageOfLinks);
    } else {
        allLinksToIssues = [];
    }
    allLinksToIssues.push(1);

    return allLinksToIssues;
};

function findNextPageOfLinks(jQuery, pageDownloader) {
    const nextPageUrl = jQuery.find('.category-page__pagination-next')[0].attributes["href"]["value"];
    if (nextPageUrl) {
        let nextWindowPage;
        pageDownloader.downloadWindowFromUrl(nextPageUrl).then(
            console.log("DONE")
        );
        console.log("DONE2");
    }
}

module.exports = CharacterAppearanceWalker;