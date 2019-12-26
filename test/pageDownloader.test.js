const fs = require('fs');
const PageDownloader = require('../src/pageDownloader');

describe.skip("Helpful tests but not good ones to spam, so leave it as skip", function () {
    it("should download as window and store inner html in file", async function () {
        const pageDownloader = new PageDownloader();
        const windowCharacterWikiPromise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                    resolve(pageDownloader.downloadWindowFromUrl("https://marvel.fandom.com/wiki/Aleksei_Sytsevich_(Earth-616)"))
                }, 3000
            )
        });
        const windowCharacterWiki = await windowCharacterWikiPromise;
        const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
        fs.writeFileSync(filePath, windowCharacterWiki.document.documentElement.innerHTML);
    });
});