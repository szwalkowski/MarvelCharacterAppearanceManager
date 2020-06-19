const fs = require('fs');
const PageDownloader = require('../src/pageDownloader');

describe.skip("Helpful tests but not good ones to spam, so leave it as skip", function () {
  it("should download as window and store inner html in file", async function () {
    this.timeout(30000);
    const pageDownloader = new PageDownloader();
    const windowCharacterWiki = await pageDownloader.downloadWindowFromUrlAsync("https://marvel.fandom.com/wiki/Unbeatable_Squirrel_Girl_Vol_2_49");
    const filePath = `${__dirname}/resources/issues/Unbeatable_Squirrel_Girl_Vol_2_49.html`;
    fs.writeFileSync(filePath, windowCharacterWiki.document.documentElement.innerHTML);
  });
});