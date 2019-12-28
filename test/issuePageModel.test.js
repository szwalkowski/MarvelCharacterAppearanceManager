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
        const rhinoPage = new IssuePageModel("https://marvel.fandom.com", pageWindow);
        assert.equal(rhinoPage.isIssue(), true);
        assert.equal(rhinoPage.getName(), "Amazing Spider-Man");
        assert.equal(rhinoPage.getVolume(), 1);
        assert.equal(rhinoPage.getIssueNo(), 41);
    });

    it("parse html for random Rhino issue appearance", function () {
        const filePath = `${__dirname}/resources/issues/Unbeatable_Squirrel_Girl_Vol_2_49.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel("https://marvel.fandom.com", pageWindow);
        assert.equal(rhinoPage.isIssue(), true);
        assert.equal(rhinoPage.getName(), "Unbeatable Squirrel Girl");
        assert.equal(rhinoPage.getVolume(), 2);
        assert.equal(rhinoPage.getIssueNo(), 49);
    });

    it("parse html for not issue but a game!", function () {
        const filePath = `${__dirname}/resources/issues/The_Amazing_Spider-Man_%26_Captain_America_in_Dr._Doom%27s_Revenge.html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new IssuePageModel("https://marvel.fandom.com", pageWindow);
        assert.equal(rhinoPage.isIssue(), false);
    });

});