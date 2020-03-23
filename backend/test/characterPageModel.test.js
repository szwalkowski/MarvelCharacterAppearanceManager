const assert = require('chai').assert;
const fs = require('fs');
const CharacterPageModel = require('../src/character/characterPageModel');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("Page model test based on downloaded html", function () {
  it("parse html for Rhino", function () {
    const filePath = `${__dirname}/resources/Aleksei_Sytsevich_(Earth-616).html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
    assert.equal(rhinoPage.getRealName(), "Aleksei Mikhailovich Sytsevich");
    assert.includeMembers(rhinoPage.getAliases(), ["Rhino", "Aleksei Popov", "Macha-Rhino", "Alex O'Hirn"]);
    assert.equal(rhinoPage.getUniverse(), "Earth-616");
    assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/1/18/Aleksei_Sytsevich_%28Earth-616%29_from_Miles_Morales_Spider-Man_Vol_1_1_001.jpg");
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
    assert.equal(rhinoPage.getRealName(), "Maybelle \"May\" Parker-Jameson");
    assert.includeMembers(rhinoPage.getAliases(), ["Aunt May", "May Reilly", "May Parker", "May Fitzgerald", "Golden Oldie", "May Morgan"]);
    assert.equal(rhinoPage.getUniverse(), "Earth-616");
    assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/7/76/May_Reilly_%28Earth-616%29_from_Howard_the_Duck_Vol_6_1_001.jpg");
    assert.equal(rhinoPage.getAppearancesCount(), 768);
    assert.equal(rhinoPage.getMinorAppearancesCount(), 116);
    assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:May_Reilly_(Earth-616)/Appearances");
    assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:May_Reilly_(Earth-616)/Minor_Appearances");
  });

  it("parse html for Black Cat that does have sup link for real name", function () {
    const filePath = `${__dirname}/resources/Felicia_Hardy_(Earth-616).html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
    assert.equal(rhinoPage.getRealName(), "Felicia Sara Hardy");
    assert.includeMembers(rhinoPage.getAliases(), [
      "Black Cat", "Ashley Moon", "Felicity Harmon", "Cat", "Licia", "Leesh", "Fee-Fee", "Kitten", "\"Miss Kyle\"", "Francesca Featherbottom"
    ]);
    assert.equal(rhinoPage.getUniverse(), "Earth-616");
    assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/f/fd/Amazing_Spider-Man_Vol_5_1_Crain_Exclusive_Black_Cat_Variant.jpg");
    assert.equal(rhinoPage.getAppearancesCount(), 380);
    assert.equal(rhinoPage.getMinorAppearancesCount(), 52);
    assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Felicia_Hardy_(Earth-616)/Appearances");
    assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Felicia_Hardy_(Earth-616)/Minor_Appearances");
  });

  it("parse html for Hammerhead that does not have link for current alias", function () {
    const filePath = `${__dirname}/resources/Hammerhead_(Joseph)_(Earth-616).html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
    assert.equal(rhinoPage.getRealName(), "Joseph(last name unrevealed)");
    assert.includeMembers(rhinoPage.getAliases(), ["Hammerhead", "Mr. H"]);
    assert.equal(rhinoPage.getUniverse(), "Earth-616");
    assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/1/15/Amazing_Spider-Man_Vol_3_17.1_Textless.jpg");
    assert.equal(rhinoPage.getAppearancesCount(), 150);
    assert.equal(rhinoPage.getMinorAppearancesCount(), 28);
    assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Hammerhead_(Joseph)_(Earth-616)/Appearances");
    assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Hammerhead_(Joseph)_(Earth-616)/Minor_Appearances");
  });

  it("parse html for Klaw that does not have weird real name", function () {
    const filePath = `${__dirname}/resources/Ulysses_Klaw_(Earth-616).html`;
    const page = fs.readFileSync(filePath, "utf-8");
    const pageWindow = new JSDOM(page).window;
    const rhinoPage = new CharacterPageModel("https://marvel.fandom.com", pageWindow);
    assert.equal(rhinoPage.getRealName(), "Ulysses S. Klaw");
    assert.includeMembers(rhinoPage.getAliases(), ["Klaw"]);
    assert.equal(rhinoPage.getUniverse(), "Earth-616");
    assert.equal(rhinoPage.getImage(), "https://vignette.wikia.nocookie.net/marveldatabase/images/1/10/Ulysses_Klaw_%28Earth-616%29_from_Superior_Carnage_Vol_1_1_001.jpg");
    assert.equal(rhinoPage.getAppearancesCount(), 165);
    assert.equal(rhinoPage.getMinorAppearancesCount(), 26);
    assert.equal(rhinoPage.getAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Ulysses_Klaw_(Earth-616)/Appearances");
    assert.equal(rhinoPage.getMinorAppearancesUrl(), "https://marvel.fandom.com/wiki/Category:Ulysses_Klaw_(Earth-616)/Minor_Appearances");
  });
});