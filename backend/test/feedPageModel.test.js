const assert = require('chai').assert;
const fs = require('fs');
const FeedPageModel = require('../src/feed/feedPageModel');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("Feed model test based on downloaded html pages", function () {
  it("parse html for feed page", function () {
    const filePath = `${__dirname}/resources/feed/RecentChanges.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const feedPage = new FeedPageModel(pageWindow, new Date("May 29, 2020 18:00"));
    const allIssueLinksSet = feedPage.getAllIssueLinksSet();
    assert.equal(allIssueLinksSet.size, 17);
    assert.isTrue(allIssueLinksSet.has("/wiki/Avengers_of_the_Wastelands_Vol_1_4"));
    assert.isTrue(allIssueLinksSet.has("/wiki/Web_of_Venom:_The_Good_Son_Vol_1_1"));
    assert.isFalse(allIssueLinksSet.has("/wiki/Avengers:_The_Private_War_of_Dr._Doom_TPB_Vol_1_1"));
    assert.equal(feedPage.getLastUpdateTime().toString(), new Date("May 29, 2020 18:11").toString());
  });

});