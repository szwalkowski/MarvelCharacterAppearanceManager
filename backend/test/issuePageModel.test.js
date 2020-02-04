const assert = require('chai').assert;
const fs = require('fs');
const IssuePageModel = require('../src/issue/issuePageModel');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
    assert.equal(rhinoPage.getAppearances()[0].focusType, "Antagonists");
    assert.equal(rhinoPage.getAppearances()[0].typesOfAppearance, "1st");
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
    assert.equal(rhinoPage.getPublishedDate(), new Date(2019, 11).getTime());
    assert.equal(rhinoPage.getAppearances()[0].title, "");
    assert.equal(rhinoPage.getAppearances()[0].focusType, "Supporting Characters");
    assert.equal(rhinoPage.getAppearances()[0].typesOfAppearance, "Past");
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
    assert.equal(spiderIssue.getPublishedDate(), new Date(1994, 2).getTime());
    assert.equal(spiderIssue.getAppearances()[0].title, "Truth and Consequences");
    assert.equal(spiderIssue.getAppearances()[0].focusType, "Featured Characters");
    assert.equal(spiderIssue.getAppearances()[0].typesOfAppearance, "");
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
    assert.equal(spiderIssue.getPublishedDate(), new Date(1993, 10).getTime());
    assert.equal(spiderIssue.getAppearances()[0].title, "Recouping Losses");
    assert.equal(spiderIssue.getAppearances()[0].focusType, "Featured Characters");
    assert.equal(spiderIssue.getAppearances()[0].typesOfAppearance, "");
    assert.equal(spiderIssue.getAppearances()[1].title, "A New Beginning");
    assert.equal(spiderIssue.getAppearances()[1].focusType, "Featured Characters");
    assert.equal(spiderIssue.getAppearances()[1].typesOfAppearance, "");
  });

  it("Problematic issue for Rhino of Mary Jane", function () {
    const filePath = `${__dirname}/resources/issues/Amazing_Mary_Jane_Vol_1_1edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const maryJaneIssue = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
    assert.equal(maryJaneIssue.isIssue, true);
    assert.equal(maryJaneIssue.getName(), "Amazing Mary Jane");
    assert.equal(maryJaneIssue.getVolume(), 1);
    assert.equal(maryJaneIssue.getIssueNo(), 1);
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(2019, 11).getTime());
    assert.equal(maryJaneIssue.getAppearances()[0].title, "");
    assert.equal(maryJaneIssue.getAppearances()[0].focusType, "Other Characters");
    assert.equal(maryJaneIssue.getAppearances()[0].typesOfAppearance, "");
    assert.equal(maryJaneIssue.getAppearances()[1], undefined);
  });

  it("parse html for official handbook?", function () {
    const filePath = `${__dirname}/resources/issues/Official_Handbook_of_the_Marvel_Universe_Vol_2_12.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const maryJaneIssue = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
    assert.equal(maryJaneIssue.isIssue, true);
    assert.equal(maryJaneIssue.getName(), "Official Handbook of the Marvel Universe");
    assert.equal(maryJaneIssue.getVolume(), 2);
    assert.equal(maryJaneIssue.getIssueNo(), 12);
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(1986, 10).getTime());
    assert.equal(maryJaneIssue.getAppearances()[0].title, undefined);
    assert.equal(maryJaneIssue.getAppearances()[0].focusType, "Featured Characters");
    assert.equal(maryJaneIssue.getAppearances()[0].typesOfAppearance, "");
    assert.equal(maryJaneIssue.getAppearances()[1], undefined);
  });

  it("parse html for appearance type in front", function () {
    const filePath = `${__dirname}/resources/issues/Marvel_Tsum_Tsum_Vol_1_2edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const maryJaneIssue = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
    assert.equal(maryJaneIssue.isIssue, true);
    assert.equal(maryJaneIssue.getName(), "Marvel Tsum Tsum");
    assert.equal(maryJaneIssue.getVolume(), 1);
    assert.equal(maryJaneIssue.getIssueNo(), 2);
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(2016, 10).getTime());
    assert.equal(maryJaneIssue.getAppearances()[0].title, "Part 2: The Tsum is Off the Rose!");
    assert.equal(maryJaneIssue.getAppearances()[0].focusType, "Other Characters");
    assert.equal(maryJaneIssue.getAppearances()[0].typesOfAppearance, "OnScreen");
    assert.equal(maryJaneIssue.getAppearances()[1], undefined);
  });

  it("parse html for appearance for 3 subtitles", function () {
    const filePath = `${__dirname}/resources/issues/Savage_Hulk_Vol_1_1edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const maryJaneIssue = new IssuePageModel(pageWindow, "Aleksei Sytsevich (Earth-616)");
    assert.equal(maryJaneIssue.isIssue, true);
    assert.equal(maryJaneIssue.getName(), "Savage Hulk");
    assert.equal(maryJaneIssue.getVolume(), 1);
    assert.equal(maryJaneIssue.getIssueNo(), 1);
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(1996, 0).getTime());
    assert.equal(maryJaneIssue.getAppearances()[0].title, "Courtroom Sequence");
    assert.equal(maryJaneIssue.getAppearances()[0].focusType, "Antagonists");
    assert.equal(maryJaneIssue.getAppearances()[0].typesOfAppearance, "");
    assert.equal(maryJaneIssue.getAppearances()[1].title, "The Power of Bullies");
    assert.equal(maryJaneIssue.getAppearances()[1].focusType, "Antagonists");
    assert.equal(maryJaneIssue.getAppearances()[1].typesOfAppearance, "");
    assert.equal(maryJaneIssue.getAppearances()[2].title, "The Strongest One There Is");
    assert.equal(maryJaneIssue.getAppearances()[2].focusType, "Antagonists");
    assert.equal(maryJaneIssue.getAppearances()[2].typesOfAppearance, "Dream");
    assert.equal(maryJaneIssue.getAppearances()[3], undefined);
  });

  it("issue has chronology! It causes problems", function () {
    const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_2edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const spiderManIssue = new IssuePageModel(pageWindow, "Adrian Toomes (Earth-616)");
    assert.equal(spiderManIssue.isIssue, true);
    assert.equal(spiderManIssue.getName(), "Amazing Spider-Man");
    assert.equal(spiderManIssue.getVolume(), 1);
    assert.equal(spiderManIssue.getIssueNo(), 2);
    assert.equal(spiderManIssue.getPublishedDate(), new Date(1963, 4).getTime());
    assert.equal(spiderManIssue.getAppearances()[0].title, "Duel to the Death with the Vulture!");
    assert.equal(spiderManIssue.getAppearances()[0].focusType, "Antagonists");
    assert.equal(spiderManIssue.getAppearances()[0].typesOfAppearance, "1st");
    assert.equal(spiderManIssue.getAppearances()[1], undefined);
  });

  it("Questprobe problems with appearances", function () {
    const filePath = `${__dirname}/resources/issues/Questprobe_Vol_1_2edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const spiderManIssue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
    assert.equal(spiderManIssue.isIssue, true);
    assert.equal(spiderManIssue.getName(), "Questprobe");
    assert.equal(spiderManIssue.getVolume(), 1);
    assert.equal(spiderManIssue.getIssueNo(), 2);
    assert.equal(spiderManIssue.getPublishedDate(), new Date(1985, 0).getTime());
    assert.equal(spiderManIssue.getAppearances()[0].title, "Mysterio Times Two!");
    assert.equal(spiderManIssue.getAppearances()[0].focusType, "Other Characters");
    assert.equal(spiderManIssue.getAppearances()[0].typesOfAppearance, "vision");
    assert.equal(spiderManIssue.getAppearances()[1], undefined);
  });

  it("Girl Comics problems with appearances cause on page it is unknown, yet its marked as character appears", function () {
    const filePath = `${__dirname}/resources/issues/Girl_Comics_Vol_2_3edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const spiderManIssue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
    assert.equal(spiderManIssue.isIssue, true);
    assert.equal(spiderManIssue.getName(), "Girl Comics");
    assert.equal(spiderManIssue.getVolume(), 2);
    assert.equal(spiderManIssue.getIssueNo(), 3);
    assert.equal(spiderManIssue.getPublishedDate(), new Date(2010, 8).getTime());
    assert.equal(spiderManIssue.getAppearances()[0], undefined);
  });

  it("Empty appearance for black cat issue", function () {
    const filePath = `${__dirname}/resources/issues/Friendly_Neighborhood_Spider-Man_Vol_2_6edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const spiderManIssue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
    assert.equal(spiderManIssue.isIssue, true);
    assert.equal(spiderManIssue.getName(), "Friendly Neighborhood Spider-Man");
    assert.equal(spiderManIssue.getVolume(), 2);
    assert.equal(spiderManIssue.getIssueNo(), 6);
    assert.equal(spiderManIssue.getPublishedDate(), new Date(2019, 6).getTime());
    assert.equal(spiderManIssue.getAppearances()[0].title, "Spider-Bite");
    assert.equal(spiderManIssue.getAppearances()[0].focusType, "Antagonists");
    assert.equal(spiderManIssue.getAppearances()[0].typesOfAppearance[0], "Imagination");
    assert.equal(spiderManIssue.getAppearances()[0].typesOfAppearance[1], "Minor");
    assert.equal(spiderManIssue.getAppearances()[1], undefined);
  });

  it("Empty appearance for black cat issue again", function () {
    const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_255edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Amazing Spider-Man");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 255);
    assert.equal(issue.getPublishedDate(), new Date(1984, 7).getTime());
    assert.equal(issue.getAppearances()[0].title, "Even a Ghost Can Fear the Night!");
    assert.equal(issue.getAppearances()[0].focusType, "Other Characters");
    assert.equal(issue.getAppearances()[0].typesOfAppearance[0], "In Peter's imagination");
    assert.equal(issue.getAppearances()[0].typesOfAppearance[1], "Minor");
    assert.equal(issue.getAppearances()[1], undefined);
  });

  it("Stories listed at begining, then appearances", function () {
    const filePath = `${__dirname}/resources/issues/Avengers_Spotlight_Vol_1_25edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Barbara Morse (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Avengers Spotlight");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 25);
    assert.equal(issue.getPublishedDate(), new Date(1989, 10).getTime());
    assert.equal(issue.getAppearances()[0].title, "Forewarned and Disarmed!");
    assert.equal(issue.getAppearances()[0].focusType, "Supporting Characters");
    assert.equal(issue.getAppearances()[0].typesOfAppearance.length, 0);
    assert.equal(issue.getAppearances()[1], undefined);
  });

  it("Some problems for appearances cause of new type villains", function () {
    const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_587edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Felicia Hardy (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Amazing Spider-Man");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 587);
    assert.equal(issue.getPublishedDate(), new Date(2009, 3).getTime());
    assert.equal(issue.getAppearances()[0].title, "Character Assassination: Part 3");
    assert.equal(issue.getAppearances()[0].focusType, "Other Characters");
    assert.equal(issue.getAppearances()[0].typesOfAppearance[0], "Screen");
    assert.equal(issue.getAppearances()[1], undefined);
  });

});