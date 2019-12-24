const assert = require('chai').assert;
const fs = require('fs');
const CharacterImporter = require('../src/character/characterImporter');

describe.skip("Helpful tests but not good ones to spam, so leave it as skip", function () {
    it("should download as window and store inner html in file", async function () {
        let characterImporter = new CharacterImporter();
        let windowCharacterWikiPromise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                    resolve(characterImporter.downloadMainPageOfCharacterWindow("https://marvel.fandom.com/wiki/Aleksei_Sytsevich_(Earth-616)"))
                }, 3000
            )
        });
        let windowCharacterWiki = await windowCharacterWikiPromise;
        const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
        fs.writeFileSync(filePath, windowCharacterWiki.document.documentElement.innerHTML);
    });
});