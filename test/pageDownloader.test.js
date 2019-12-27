const fs = require('fs');
const PageDownloader = require('../src/pageDownloader');

/*
 Pages to test:
 https://marvel.fandom.com/wiki/Aleksei_Sytsevich_(Earth-616)
 https://marvel.fandom.com/wiki/May_Reilly_(Earth-616)
 */

describe.skip("Helpful tests but not good ones to spam, so leave it as skip", function () {
    it("should download as window and store inner html in file", async function () {
        this.timeout(30000);
        const pageDownloader = new PageDownloader();
        const windowCharacterWikiPromise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                    resolve(pageDownloader.downloadWindowFromUrl("https://marvel.fandom.com/wiki/Aleksei_Sytsevich_(Earth-616)"))
                }, 30000
            )
        });
        const windowCharacterWiki = await windowCharacterWikiPromise;
        const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
        fs.writeFileSync(filePath, windowCharacterWiki.document.documentElement.innerHTML);
    });
});