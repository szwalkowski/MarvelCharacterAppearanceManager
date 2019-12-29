const assert = require('chai').assert;
const fs = require('fs');
const IssuePageModel = require('../src/issue/issuePageModel');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html for issues", function () {
    it("parse html for first Rhino issue appearance", function () {
        const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_41.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "/wiki/Aleksei_Sytsevich_(Earth-616)");
        assert.equal(rhinoPage.isIssue(), true);
        assert.equal(rhinoPage.getName(), "Amazing Spider-Man");
        assert.equal(rhinoPage.getVolume(), 1);
        assert.equal(rhinoPage.getIssueNo(), 41);
        assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d0/Amazing_Spider-Man_Vol_1_41.jpg/revision/latest/scale-to-width-down/300?cb=20171229055342");
        assert.equal(rhinoPage.getPublishedDate(), new Date(1966, 9).getTime());
        assert.equal(rhinoPage.getCharacterFocusType(), "(First appearance)");
        assert.equal(rhinoPage.getAppearanceType(), "Supporting Characters");
        assert.equal(rhinoPage.getSubtitle(), "");
    });

    it("parse html for random Rhino issue appearance", function () {
        const filePath = `${__dirname}/resources/issues/Unbeatable_Squirrel_Girl_Vol_2_49.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "/wiki/Aleksei_Sytsevich_(Earth-616)");
        assert.equal(rhinoPage.isIssue(), true);
        assert.equal(rhinoPage.getName(), "Unbeatable Squirrel Girl");
        assert.equal(rhinoPage.getVolume(), 2);
        assert.equal(rhinoPage.getIssueNo(), 49);
        assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d1/Unbeatable_Squirrel_Girl_Vol_2_49.jpg/revision/latest/scale-to-width-down/300?cb=20190921203554");
        assert.equal(rhinoPage.getPublishedDate(), new Date(2019, 11).getTime());
        assert.equal(rhinoPage.getCharacterFocusType(), "(Past)");
        assert.equal(rhinoPage.getAppearanceType(), "Antagonists");
        assert.equal(rhinoPage.getSubtitle(), "The Horns of the Rhino!");
    });

    it("parse html for not issue but a game!", function () {
        const filePath = `${__dirname}/resources/issues/The_Amazing_Spider-Man_%26_Captain_America_in_Dr._Doom%27s_Revenge.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "/wiki/Aleksei_Sytsevich_(Earth-616)");
        assert.equal(rhinoPage.isIssue(), false);
    });

});