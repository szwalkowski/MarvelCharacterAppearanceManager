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
 https://marvel.fandom.com/wiki/The_Spectacular_Spider-Man_Vol_1_210?action=edit
 https://marvel.fandom.com/wiki/Silver_Sable_and_the_Wild_Pack_Vol_1_18?action=edit
 https://marvel.fandom.com/wiki/Amazing_Mary_Jane_Vol_1_1?action=edit
 https://marvel.fandom.com/wiki/Official_Handbook_of_the_Marvel_Universe_Vol_2_12?action=edit

 https://marvel.fandom.com/wiki/Savage_Hulk_Vol_1_1?action=edit
 https://marvel.fandom.com/wiki/Marvel_Tsum_Tsum_Vol_1_2?action=edit
 https://marvel.fandom.com/wiki/Amazing_Spider-Man_Vol_1_2?action=edit
 https://marvel.fandom.com/wiki/Questprobe_Vol_1_2?action=edit
 https://marvel.fandom.com/wiki/Girl_Comics_Vol_2_3?action=edit
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