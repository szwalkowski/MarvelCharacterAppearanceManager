const assert = require('chai').assert;
const fs = require('fs');
const CharacterPageModel = require('../src/character/characterPageModel');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Page model test based on downloaded html", function () {
    it("should download as window and store inner html in file", function () {
        const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
        const page = fs.readFileSync(filePath, "utf-8");
        const pageWindow = new JSDOM(page).window;
        const rhinoPage = new CharacterPageModel(pageWindow);
        assert.equal(rhinoPage.GetRealName(), "Aleksei Mikhailovich Sytsevich");
        assert.equal(rhinoPage.GetCurrentAlias(), "Rhino");
        assert.equal(rhinoPage.GetUniverse(), "Earth-616");
    });
});