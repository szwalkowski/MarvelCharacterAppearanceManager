const assert = require('chai').assert;
const fs = require('fs');
const IssuePageModel = require('../src/issue/issuePageModel');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html for issues", function () {
    it("parse html for first Rhino issue appearance", function () {
        const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_41edit.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
        assert.equal(rhinoPage.isIssue, true);
        assert.equal(rhinoPage.getName(), "Amazing Spider-Man");
        assert.equal(rhinoPage.getVolume(), 1);
        assert.equal(rhinoPage.getIssueNo(), 41);
        //assert.equal(rhinoPage.getImage(),
        // "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d0/Amazing_Spider-Man_Vol_1_41.jpg/revision/latest/scale-to-width-down/300?cb=20171229055342");
        assert.equal(rhinoPage.getPublishedDate(), new Date(1966, 9).getTime());
        assert.equal(rhinoPage.getAppearances()[0].title, "The Horns of the Rhino!");
        assert.equal(rhinoPage.getAppearances()[0].focusType, "Antagonist");
        assert.equal(rhinoPage.getAppearances()[0].typeOfAppearance, "1st");
        assert.equal(rhinoPage.getAppearances()[1], undefined);
    });

    it("parse html for random Rhino issue appearance", function () {
        const filePath = `${__dirname}/resources/issues/Unbeatable_Squirrel_Girl_Vol_2_49edit.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
        assert.equal(rhinoPage.isIssue, true);
        assert.equal(rhinoPage.getName(), "Unbeatable Squirrel Girl");
        assert.equal(rhinoPage.getVolume(), 2);
        assert.equal(rhinoPage.getIssueNo(), 49);
        //assert.equal(rhinoPage.getImage(),
        // "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d1/Unbeatable_Squirrel_Girl_Vol_2_49.jpg/revision/latest/scale-to-width-down/300?cb=20190921203554");
        assert.equal(rhinoPage.getPublishedDate(), new Date(2019, 11).getTime());
        assert.equal(rhinoPage.getAppearances()[0].title, "");
        assert.equal(rhinoPage.getAppearances()[0].focusType, "Supporting Character");
        assert.equal(rhinoPage.getAppearances()[0].typeOfAppearance, "Past");
        assert.equal(rhinoPage.getAppearances()[1], undefined);
    });

    it("parse html for not issue but a game!", function () {
        const filePath = `${__dirname}/resources/issues/The_Amazing_Spider-Man_%26_Captain_America_in_Dr._Doom%27s_Revengeedit.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel(pageWindow, "/wiki/Aleksei_Sytsevich_(Earth-616)");
        assert.equal(rhinoPage.isIssue, false);
    });

    it("parse html for random Black Cat issue appearance but not on first story", function () {
        const filePath = `${__dirname}/resources/issues/The_Spectacular_Spider-Man_Vol_1_210edit.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const spiderIssue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
        assert.equal(spiderIssue.isIssue, true);
        assert.equal(spiderIssue.getName(), "The Spectacular Spider-Man");
        assert.equal(spiderIssue.getVolume(), 1);
        assert.equal(spiderIssue.getIssueNo(), 210);
        //assert.equal(spiderIssue.getImage(),
        // "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d1/Unbeatable_Squirrel_Girl_Vol_2_49.jpg/revision/latest/scale-to-width-down/300?cb=20190921203554");
        assert.equal(spiderIssue.getPublishedDate(), new Date(1994, 2).getTime());
        assert.equal(spiderIssue.getAppearances()[0].title, "Truth and Consequences");
        assert.equal(spiderIssue.getAppearances()[0].focusType, "Featured Character");
        assert.equal(spiderIssue.getAppearances()[0].typeOfAppearance, "");
        assert.equal(spiderIssue.getAppearances()[1], undefined);
    });

    it("parse html for random Silver Sable issue appearance in two titles", function () {
        const filePath = `${__dirname}/resources/issues/Silver_Sable_and_the_Wild_Pack_Vol_1_18edit.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const spiderIssue = new IssuePageModel(pageWindow, "Silver Sablinova (Earth-616)");
        assert.equal(spiderIssue.isIssue, true);
        assert.equal(spiderIssue.getName(), "Silver Sable and the Wild Pack");
        assert.equal(spiderIssue.getVolume(), 1);
        assert.equal(spiderIssue.getIssueNo(), 18);
        //assert.equal(spiderIssue.getImage(),
        // "https://vignette.wikia.nocookie.net/marveldatabase/images/d/d1/Unbeatable_Squirrel_Girl_Vol_2_49.jpg/revision/latest/scale-to-width-down/300?cb=20190921203554");
        assert.equal(spiderIssue.getPublishedDate(), new Date(1993, 10).getTime());
        assert.equal(spiderIssue.getAppearances()[0].title, "Recouping Losses");
        assert.equal(spiderIssue.getAppearances()[0].focusType, "Featured Character");
        assert.equal(spiderIssue.getAppearances()[0].typeOfAppearance, "");
        assert.equal(spiderIssue.getAppearances()[1].title, "A New Beginning");
        assert.equal(spiderIssue.getAppearances()[1].focusType, "Featured Character");
        assert.equal(spiderIssue.getAppearances()[1].typeOfAppearance, "");
    });

});