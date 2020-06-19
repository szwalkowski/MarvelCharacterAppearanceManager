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
    const rhinoPage = new IssuePageModel(pageWindow);
    assert.equal(rhinoPage.isIssue, true);
    assert.equal(rhinoPage.getName(), "Amazing Spider-Man");
    assert.equal(rhinoPage.getVolume(), 1);
    assert.equal(rhinoPage.getIssueNo(), 41);
    assert.equal(rhinoPage.getImage(), "Amazing_Spider-Man_Vol_1_41.jpg");
    assert.equal(rhinoPage.getPublishedDate(), new Date(1966, 9).getTime());
    const appearances = rhinoPage.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, "The Horns of the Rhino!");
    assert.equal(appearances[0].focusType, "Antagonists");
    assert.equal(appearances[0].typesOfAppearance, "1ST");
    assert.equal(appearances[0].storyOrdinal, 1);
    assert.equal(appearances[1], undefined);
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
    assert.equal(rhinoPage.getImage(), "Unbeatable_Squirrel_Girl_Vol_2_49.jpg");
    assert.equal(rhinoPage.getPublishedDate(), new Date(2019, 11).getTime());
    const appearances = rhinoPage.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, "");
    assert.equal(appearances[0].focusType, "Supporting Characters");
    assert.equal(appearances[0].typesOfAppearance, "PAST");
    assert.equal(appearances[0].storyOrdinal, 1);
    assert.equal(appearances[1], undefined);
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
    assert.equal(spiderIssue.getImage(), "The_Spectacular_Spider-Man_Vol_1_210.jpg");
    assert.equal(spiderIssue.getPublishedDate(), new Date(1994, 2).getTime());
    const appearances = spiderIssue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0].title, "Truth and Consequences");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance, "");
    assert.equal(appearances[0].storyOrdinal, 2);
    assert.equal(appearances[1], undefined);
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
    assert.equal(spiderIssue.getImage(), "Silver_Sable_and_the_Wild_Pack_Vol_1_18.jpg");
    assert.equal(spiderIssue.getPublishedDate(), new Date(1993, 10).getTime());
    const appearances = spiderIssue.getAppearances("Silver_Sablinova_(Earth-616)");
    assert.equal(appearances[0].title, "Recouping Losses");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance, "");
    assert.equal(appearances[1].title, "A New Beginning");
    assert.equal(appearances[1].focusType, "Featured Characters");
    assert.equal(appearances[1].typesOfAppearance, "");
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
    assert.equal(maryJaneIssue.getImage(), "Amazing_Mary_Jane_Vol_1_1.jpg");
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(2019, 11).getTime());
    const appearances = maryJaneIssue.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, "");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance, "");
    assert.equal(appearances[1], undefined);
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
    assert.equal(maryJaneIssue.getImage(), "Official_Handbook_of_the_Marvel_Universe_Vol_2_12.jpg");
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(1986, 10).getTime());
    const appearances = maryJaneIssue.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, undefined);
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance, "");
    assert.equal(appearances[1], undefined);
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
    assert.equal(maryJaneIssue.getImage(), "Marvel_Tsum_Tsum_Vol_1_2.jpg");
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(2016, 10).getTime());
    const appearances = maryJaneIssue.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, "Part 2: The Tsum is Off the Rose!");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance, "ONSCREEN");
    assert.equal(appearances[1], undefined);
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
    assert.equal(maryJaneIssue.getImage(), "Savage_Hulk_Vol_1_1.jpg");
    assert.equal(maryJaneIssue.getPublishedDate(), new Date(1996, 0).getTime());
    const appearances = maryJaneIssue.getAppearances("Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearances[0].title, "Courtroom Sequence");
    assert.equal(appearances[0].focusType, "Antagonists");
    assert.equal(appearances[0].typesOfAppearance, "");
    assert.equal(appearances[1].title, "The Power of Bullies");
    assert.equal(appearances[1].focusType, "Antagonists");
    assert.equal(appearances[1].typesOfAppearance, "");
    assert.equal(appearances[2].title, "The Strongest One There Is");
    assert.equal(appearances[2].focusType, "Antagonists");
    assert.equal(appearances[2].typesOfAppearance, "DREAM");
    assert.equal(appearances[3], undefined);
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
    assert.equal(spiderManIssue.getImage(), "Amazing_Spider-Man_Vol_1_2.jpg");
    assert.equal(spiderManIssue.getPublishedDate(), new Date(1963, 4).getTime());
    const appearances = spiderManIssue.getAppearances("Adrian_Toomes_(Earth-616)");
    assert.equal(appearances[0].title, "Duel to the Death with the Vulture!");
    assert.equal(appearances[0].focusType, "Antagonists");
    assert.equal(appearances[0].typesOfAppearance, "1ST");
    assert.equal(appearances[1], undefined);
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
    assert.equal(spiderManIssue.getImage(), "Questprobe_Vol_1_2.jpg");
    assert.equal(spiderManIssue.getPublishedDate(), new Date(1985, 0).getTime());
    const appearances = spiderManIssue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0].title, "Mysterio Times Two!");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance, "VISION");
    assert.equal(appearances[1], undefined);
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
    assert.equal(spiderManIssue.getImage(), "Girl_Comics_Vol_2_3.jpg");
    assert.equal(spiderManIssue.getPublishedDate(), new Date(2010, 8).getTime());
    const appearances = spiderManIssue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0], undefined);
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
    assert.equal(spiderManIssue.getImage(), "Friendly_Neighborhood_Spider-Man_Vol_2_6.jpg");
    assert.equal(spiderManIssue.getPublishedDate(), new Date(2019, 6).getTime());
    const appearances = spiderManIssue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0].title, "Spider-Bite");
    assert.equal(appearances[0].focusType, "Antagonists");
    assert.equal(appearances[0].typesOfAppearance, "MINOR,IMAGINATION");
    assert.equal(appearances[1], undefined);
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
    assert.equal(issue.getImage(), "Amazing_Spider-Man_Vol_1_255.jpg");
    assert.equal(issue.getPublishedDate(), new Date(1984, 7).getTime());
    const appearances = issue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0].title, "Even a Ghost Can Fear the Night!");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance, "MINOR,IN PETER'S IMAGINATION");
    assert.equal(appearances[1], undefined);
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
    assert.equal(issue.getImage(), "Avengers_Spotlight_Vol_1_25.jpg");
    assert.equal(issue.getPublishedDate(), new Date(1989, 10).getTime());
    const appearances = issue.getAppearances("Barbara_Morse_(Earth-616)");
    assert.equal(appearances[0].title, "Forewarned and Disarmed!");
    assert.equal(appearances[0].focusType, "Supporting Characters");
    assert.equal(appearances[0].typesOfAppearance.length, 0);
    assert.equal(appearances[1], undefined);
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
    assert.equal(issue.getImage(), "Amazing_Spider-Man_Vol_1_587.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2009, 3).getTime());
    const appearances = issue.getAppearances("Felicia_Hardy_(Earth-616)");
    assert.equal(appearances[0].title, "Character Assassination: Part 3");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance[0], "SCREEN");
    assert.equal(appearances[1], undefined);
  });

  it("Some problems for appearances cause of longer volume and issue string with spaces", function () {
    const filePath = `${__dirname}/resources/issues/Free_Comic_Book_Day_Vol_2016_(Captain_America)edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Steven Rogers (Earth-61311)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Free Comic Book Day");
    assert.equal(issue.getVolume(), 2016);
    assert.equal(issue.getIssueNo(), "(Captain America)");
    assert.equal(issue.getImage(), "Free_Comic_Book_Day_Vol_2016_Captain_America.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2016, 4).getTime());
    const appearances = issue.getAppearances("Steven_Rogers_(Earth-61311)");
    assert.equal(appearances[0].title, "");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance[0], "FLASHBACK");
    assert.equal(appearances[1], undefined);
  });

  it("issue with apostrophe", function () {
    const filePath = `${__dirname}/resources/issues/Season's_Beating_Vol_1_1edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Wade Wilson (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Season's Beating");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), "1");
    assert.equal(issue.getImage(), "Season's_Beating_Vol_1_1.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2019, 1).getTime());
    const appearances = issue.getAppearances("Wade_Wilson_(Earth-616)");
    assert.equal(appearances[0].title, "");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance.length, 0);
    assert.equal(appearances[1], undefined);
  });

  it("issue without image should find default file by id", function () {
    const filePath = `${__dirname}/resources/issues/Amazing_Spider-Man_Vol_1_533edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Criti Noll (Clone) (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Amazing Spider-Man");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), "533");
    issue.id = "Amazing_Spider-Man_Vol_1_533";
    assert.equal(issue.getImage(), "Amazing_Spider-Man_Vol_1_533.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2006, 7).getTime());
    const appearances = issue.getAppearances("Criti_Noll_(Clone)_(Earth-616)");
    assert.equal(appearances[0].title, "The Night the War Came Home: Part Two of Six");
    assert.equal(appearances[0].focusType, "Other Characters");
    assert.equal(appearances[0].typesOfAppearance, "CAMEO,IMPERSONATES");
    assert.equal(appearances[1], undefined);
  });

  it("issue without volume", function () {
    const filePath = `${__dirname}/resources/issues/Spider-Man_Doctor_Octopus_(Promo)edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Benjamin Grimm (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Spider-Man: Doctor Octopus (Promo)");
    assert.equal(issue.getVolume(), null);
    assert.equal(issue.getIssueNo(), null);
    issue.id = "Spider-Man:_Doctor_Octopus_(Promo)";
    assert.equal(issue.getImage(), "Spider-Man_Doctor_Octopus_(Promo).jpg");
    assert.equal(issue.getPublishedDate(), new Date(2005, 0).getTime());
    const appearances = issue.getAppearances("Benjamin_Grimm_(Earth-616)");
    assert.equal(appearances[0].title, "Spider-Man versus Doctor Octopus");
    assert.equal(appearances[0].focusType, "Supporting Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
  });

  it("Issue with tags around appearing", function () {
    const filePath = `${__dirname}/resources/issues/Spider-Woman_Vol_1_1edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow, "Jessica Drew (Earth-616)");
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Spider-Woman");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 1);
    issue.id = "Spider-Woman_Vol_1_1";
    assert.equal(issue.getImage(), "Spider-Woman_Vol_1_1.jpg");
    assert.equal(issue.getPublishedDate(), new Date(1978, 3).getTime());
    const appearances = issue.getAppearances("Jessica_Drew_(Earth-616)");
    assert.equal(appearances[0].title, "...A Future Uncertain!");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
  });

  it("Issue to not focused character", function () {
    const filePath = `${__dirname}/resources/issues/Avengers_The_Initiative_Vol_1_4edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow);
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Avengers: The Initiative");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 4);
    issue.id = "Avengers_The_Initiative_Vol_1_4";
    assert.equal(issue.getImage(), "Avengers_The_Initiative_Vol_1_4.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2007, 8).getTime());
  });

  it("Issue that has colon before appearance", function () {
    const filePath = `${__dirname}/resources/issues/Doctor_Doom_and_the_Masters_of_Evil_Vol_1_2edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow);
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Doctor Doom and the Masters of Evil");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 2);
    issue.id = "Doctor_Doom_and_the_Masters_of_Evil_Vol_1_2";
    assert.equal(issue.getImage(), "Doctor_Doom_and_the_Masters_of_Evil_Vol_1_2.jpg");
    assert.equal(issue.getPublishedDate(), new Date(2009, 3).getTime());
    const appearances = issue.getAppearances("Bruno_Horgan_(Earth-616)");
    assert.equal(appearances[0].title, "What Is Doom After?");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
  });

  it("Iron man happens to be twice in same story", function () {
    const filePath = `${__dirname}/resources/issues/Iron_Man_Vol_2_11edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow);
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Iron Man");
    assert.equal(issue.getVolume(), 2);
    assert.equal(issue.getIssueNo(), 11);
    issue.id = "Iron_Man_Vol_2_11";
    assert.equal(issue.getImage(), "Iron_Man_Vol_2_11.jpg");
    assert.equal(issue.getPublishedDate(), new Date(1997, 8).getTime());
    const appearances = issue.getAppearances("Anthony_Stark_(Earth-616)");
    assert.equal(appearances[0].title, "Magical Mystery Tour");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1].title, "Magical Mystery Tour");
    assert.equal(appearances[1].focusType, "Other Characters");
    assert.equal(appearances[1].typesOfAppearance, "PAST");
    assert.equal(appearances[2].title, "Magical Mystery Tour");
    assert.equal(appearances[2].focusType, "Other Characters");
    assert.equal(appearances[2].typesOfAppearance, "AGAIN PAST");
    assert.equal(appearances[3], undefined);
  });

  it("Problem of Sandman", function () {
    const filePath = `${__dirname}/resources/issues/Silver_Sable_and_the_Wild_Pack_Vol_1_21edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow);
    assert.equal(issue.isIssue, true);
    assert.equal(issue.getName(), "Silver Sable and the Wild Pack");
    assert.equal(issue.getVolume(), 1);
    assert.equal(issue.getIssueNo(), 21);
    issue.id = "Silver_Sable_and_the_Wild_Pack_Vol_1_21";
    assert.equal(issue.getImage(), "Silver_Sable_and_the_Wild_Pack_Vol_1_21.jpg");
    assert.equal(issue.getPublishedDate(), new Date(1994, 1).getTime());
    const appearances = issue.getAppearances("William_Baker_(Earth-616)");
    assert.equal(appearances[0].title, "Home of the Bodybag");
    assert.equal(appearances[0].focusType, "Featured Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
  });

  it("Problem of not standard h3 subissues", function () {
    const filePath = `${__dirname}/resources/issues/Thing_Vol_2_5edit.html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const issue = new IssuePageModel(pageWindow);
    let appearances = issue.getAppearances("William_Baker_(Earth-616)");
    assert.equal(appearances[0].title, "Part One: Give till it hurts...");
    assert.equal(appearances[0].focusType, "Antagonists");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
    appearances = issue.getAppearances("Carlotta_LaRosa_(Earth-616)");
    assert.equal(appearances[0].title, "Part One: Give till it hurts...");
    assert.equal(appearances[0].focusType, "Supporting Characters");
    assert.equal(appearances[0].typesOfAppearance[0], undefined);
    assert.equal(appearances[1], undefined);
  });

});