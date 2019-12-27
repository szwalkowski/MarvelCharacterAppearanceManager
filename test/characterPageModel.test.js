const assert = require('chai').assert;
const fs = require('fs');
const CharacterPageModel = require('../src/character/characterPageModel');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html", function () {
    it("parse html for Rhino", function () {
        const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
        assert.equal(rhinoPage.getId(), "Aleksei Sytsevich (Earth-616)");
        assert.equal(rhinoPage.getRealName(), "Aleksei Mikhailovich Sytsevich");
        assert.equal(rhinoPage.getCurrentAlias(), "Rhino");
        assert.equal(rhinoPage.getUniverse(), "Earth-616");
        assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/1/18/Aleksei_Sytsevich_%28Earth-616%29_from_Miles_Morales_Spider-Man_Vol_1_1_001.jpg/revision/latest/scale-to-width-down/325?cb=20191010044711");
        assert.equal(rhinoPage.getAppearancesCount(), 252);
        assert.equal(rhinoPage.getMinorAppearancesCount(), 58);
        assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Aleksei_Sytsevich_(Earth-616)/Appearances");
        assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Aleksei_Sytsevich_(Earth-616)/Minor_Appearances");
    });

    it("parse html for Aunt May that does not have current alias and url under real name", function () {
        const filePath = `${__dirname}/resources/May_Reilly_(Earth-616).html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
        assert.equal(rhinoPage.getId(), "May Reilly (Earth-616)");
        assert.equal(rhinoPage.getRealName(), "Maybelle \"May\" Parker-Jameson");
        assert.equal(rhinoPage.getCurrentAlias(), "Aunt May");
        assert.equal(rhinoPage.getUniverse(), "Earth-616");
        assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/7/76/May_Reilly_%28Earth-616%29_from_Howard_the_Duck_Vol_6_1_001.jpg/revision/latest/scale-to-width-down/269?cb=20150820184738");
        assert.equal(rhinoPage.getAppearancesCount(), 768);
        assert.equal(rhinoPage.getMinorAppearancesCount(), 116);
        assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:May_Reilly_(Earth-616)/Appearances");
        assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:May_Reilly_(Earth-616)/Minor_Appearances");
    });
});