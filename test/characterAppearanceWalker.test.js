const assert = require('chai').assert;
const fs = require('fs');
const CharacterAppearanceWalker = require('../src/character/characterAppearanceWalker');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html", function () {
    it("parse html for Rhino", function () {
        const filePath = `${__dirname}/resources/appearances/Aleksei_Sytsevich_(Earth-616).html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoAppearanceLinks = new CharacterAppearanceWalker().findAllLinksToIssues(pageWindow);
        assert.equal(rhinoAppearanceLinks.length, 258);
    });
});