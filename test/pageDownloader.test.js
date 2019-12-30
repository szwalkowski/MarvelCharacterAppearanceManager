const fs = require('fs');
const PageDownloader = require('../src/pageDownloader');

/*
 Pages to test:
 characters:
 https://marvel.fandom.com/wiki/Aleksei_Sytsevich_(Earth-616)
 https://marvel.fandom.com/wiki/May_Reilly_(Earth-616)
 https://marvel.fandom.com/wiki/Felicia_Hardy_(Earth-616)
 https://marvel.fandom.com/wiki/Hammerhead_(Joseph)_(Earth-616)
 https://marvel.fandom.com/wiki/Ulysses_Klaw_(Earth-616)

 issues:
 https://marvel.fandom.com/wiki/Amazing_Spider-Man_Vol_1_41
 https://marvel.fandom.com/wiki/Unbeatable_Squirrel_Girl_Vol_2_49
 https://marvel.fandom.com/wiki/The_Amazing_Spider-Man_%26_Captain_America_in_Dr._Doom%27s_Revenge! <-- not an issue!!!!

 issues edit sites:
 https://marvel.fandom.com/wiki/Amazing_Spider-Man_Vol_1_41?action=edit
 https://marvel.fandom.com/wiki/Unbeatable_Squirrel_Girl_Vol_2_49?action=edit
 https://marvel.fandom.com/wiki/The_Amazing_Spider-Man_%26_Captain_America_in_Dr._Doom%27s_Revenge!?action=edit
 */

describe.skip("Helpful tests but not good ones to spam, so leave it as skip", function () {
    it("should download as window and store inner html in file", async function () {
        this.timeout(30000);
        const pageDownloader = new PageDownloader();
        const windowCharacterWiki = await pageDownloader.downloadWindowFromUrlAsync("https://marvel.fandom.com/wiki/Unbeatable_Squirrel_Girl_Vol_2_49");
        const filePath = `${__dirname}/resources/issues/Unbeatable_Squirrel_Girl_Vol_2_49.html`;
        fs.writeFileSync(filePath, windowCharacterWiki.document.documentElement.innerHTML);
    });
});