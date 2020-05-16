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
    const feedPage = new FeedPageModel(pageWindow);
    const allIssueLinksSet = feedPage.getAllIssueLinksSet();
    assert.equal(allIssueLinksSet.size, 197);
    assert.isTrue(allIssueLinksSet.has("/wiki/New_Avengers_Annual_Vol_2_1"));
    assert.isTrue(allIssueLinksSet.has("/wiki/Avengers_Annual_Vol_4_1"));
    assert.isTrue(allIssueLinksSet.has("/wiki/Deadpool%27s_Secret_Secret_Wars_Vol_1_1"));
  });

});