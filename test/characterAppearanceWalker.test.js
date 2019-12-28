const assert = require('chai').assert;
const fs = require('fs');
const CharacterAppearanceWalker = require('../src/character/characterAppearanceWalker');
const PageDownloader = require('../src/pageDownloader');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html", function () {
    it("parse html for Rhino", async function () {
        const filePath = `${__dirname}/resources/appearances/Aleksei_Sytsevich_(Earth-616).html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoAppearanceLinks = await new CharacterAppearanceWalker().findAllLinksToIssuesAsync(pageWindow);
        assert.equal(rhinoAppearanceLinks.length, 200);
    });

    it.skip("parse html for Rhino but use online source - there are more than 200 of course", async function () {
        this.timeout(30000);
        const windowPromise = await new PageDownloader().downloadWindowFromUrlAsync("https://marvel.fandom.com/wiki/Category:Aleksei_Sytsevich_(Earth-616)/Appearances");
        const rhinoAppearanceLinks = await new CharacterAppearanceWalker().findAllLinksToIssuesAsync(windowPromise);
        assert.equal(rhinoAppearanceLinks.length, 248);
    });
});