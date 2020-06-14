const assert = require('chai').assert;
const AppearingResolver = require('../src/issue/appearingResolver');

describe("Test for appearing resolver", function () {
  it("Parse basic appearing with []", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{A|[[T'Challa (Earth-616)|Black Panther (King T'Challa)]]}}");
    assert.equal(appearing[0].id, "T'Challa_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Parse basic appearing without []", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{A|T'Challa (Earth-616)|Black Panther (King T'Challa)}}");
    assert.equal(appearing[0].id, "T'Challa_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Parse basic appearing and tag", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{A|T'Challa (Earth-616)|Black Panther (King T'Challa)|Death}}");
    assert.equal(appearing[0].id, "T'Challa_(Earth-616)");
    assert.equal(appearing[0].tags[0], "DEATH");
  });

  it("Parse basic apn appearing", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{aPn|[[John Jonah Jameson (Earth-616)|J. Jonah Jameson]]|Amazing Spider-Man Annunal #3|}}");
    assert.equal(appearing[0].id, "John_Jonah_Jameson_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Parse basic apn appearing with additional tags", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{apn|[[Aleksei Sytsevich (Earth-616)|Rhino]]|Web of Spider-Man Vol 2 3|}} {{1st}}");
    assert.equal(appearing[0].id, "Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearing[0].tags, "1ST");
  });

  it("Parse basic g appearance appearing with additional tags", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{g|[[Aleksei Sytsevich (Earth-616)|Rhino (Aleksei Sytsevich)]]|Past}}");
    assert.equal(appearing[0].id, "Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearing[0].tags, "PAST");
  });

  it("Parse custom appearance appearing without additional tags", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{OnScreen|[[Aleksei Sytsevich (Earth-616)|Rhino (Aleksei Sytsevich)]]}}");
    assert.equal(appearing[0].id, "Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearing[0].tags, "ONSCREEN");
  });

  it("Parse custom appearance appearing with additional tags", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{Recap|[[Doreen Green (Earth-616)|Squirrel Girl (Doreen Green)]]}} {{ApDeath}}");
    assert.equal(appearing[0].id, "Doreen_Green_(Earth-616)");
    assert.equal(appearing[0].tags, "RECAP,APDEATH");
  });

  it("Chronology and ChronoFB is ignored", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{A|[[Doreen Green (Earth-616)|Squirrel Girl]]}} {{Chronology}} {{ChronoFB}}");
    assert.equal(appearing[0].id, "Doreen_Green_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Possessed by - ignore by whom", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{A|[[Doreen Green (Earth-616)|Squirrel Girl]]}} {{Possessed|Foo}}");
    assert.equal(appearing[0].id, "Doreen_Green_(Earth-616)");
    assert.equal(appearing[0].tags, "POSSESSED");
  });

  it("Minor and dream", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{Minor|Lunella Lafayette (Earth-616)|Moon Girl (Lunella Lafayette)|Dream}}");
    assert.equal(appearing[0].id, "Lunella_Lafayette_(Earth-616)");
    assert.equal(appearing[0].tags, "MINOR,DREAM");
  });

  it("Cameo and Impersonates", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{Cameo|[[Criti Noll (Clone) (Earth-616)|Yellowjacket (Criti Noll)]]}} {{Impersonates|[[Henry Pym (Earth-616)|Dr. Hank Pym]]}}");
    assert.equal(appearing[0].id, "Criti_Noll_(Clone)_(Earth-616)");
    assert.equal(appearing[0].tags, "CAMEO,IMPERSONATES");
  });

  it("OnScreenOnly", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{OnScreenOnly|[[Vision (Earth-616)|Vision]]}}");
    assert.equal(appearing[0].id, "Vision_(Earth-616)");
    assert.equal(appearing[0].tags, "ONSCREENONLY");
  });

  it("Empty quotes", function () {
    const appearing = new AppearingResolver().resolveAppearing("* '''{{a|[[Ulysses Klaw (Earth-616)|Klaw]]}}'''");
    assert.equal(appearing[0].id, "Ulysses_Klaw_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Comment hidden in appearing", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{Minor|[[Matthew Murdock (Earth-616)|Daredevil (Matt Murdock)]]}} \<!-- Not a full" +
      " appearance because the majority of the arc is unknowingly a dream. -->");
    assert.equal(appearing[0].id, "Matthew_Murdock_(Earth-616)");
    assert.equal(appearing[0].tags, "MINOR");
  });

  it("Dash thing", function () {
    const appearing = new AppearingResolver()
      .resolveAppearing("** {{apn|[[Aleksei Sytsevich (Earth-616)|Rhino]]|Amazing Spider-Man Vol 1 280|Amazing Spider-Man #280}} - {{OnScreen}}");
    assert.equal(appearing[0].id, "Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearing[0].tags, "ONSCREEN");
  });

  it("Big combo line", function () {
    const appearing = new AppearingResolver()
      .resolveAppearing(
        "** {{apn|[[Angela del Toro (Earth-58163)|White Tiger (Angela del Toro)]]|House of M: Avengers #5}} {{1stHist}} {{g|Possessed by {{a|[[Angela del Toro (Earth-616)|White Tiger]]}}}}"
      );
    assert.equal(appearing[0].id, "Angela_del_Toro_(Earth-58163)");
    assert.equal(appearing[0].tags, "1STHIST,POSSESSED");
    assert.equal(appearing[1].id, "Angela_del_Toro_(Earth-616)");
    assert.equal(appearing[1].tags, "POSSESSES");
  });

  it("impersonation", function () {
    const appearing = new AppearingResolver()
      .resolveAppearing("* {{a|[[Felicia Hardy (Earth-616)|Black Cat (Felicia Hardy)]]}} {{Impersonates|[[Peter Parker (Earth-616)|Spider-Man]]}}");
    assert.equal(appearing[0].id, "Felicia_Hardy_(Earth-616)");
    assert.equal(appearing[0].tags, "IMPERSONATES");
    assert.equal(appearing[1].id, "Peter_Parker_(Earth-616)");
    assert.equal(appearing[1].tags, "IMPERSONATED");
  });

  it("impersonation test 2", function () {
    const appearing = new AppearingResolver()
      .resolveAppearing("* {{g|[[Peter Parker (Earth-616)|Spider-Man (Peter Parker)]]|Impersonates Silvio's daughter's fiancé}}");
    assert.equal(appearing[0].id, "Peter_Parker_(Earth-616)");
    assert.equal(appearing[0].tags, "IMPERSONATES");
  });

  it("Rhino that appears and joins", function () {
    const appearing = new AppearingResolver()
      .resolveAppearing(
        "* {{g|[[Aleksei Sytsevich (Earth-616)|Aleksey Sytsevich]]|Appears as [[Rhino]] in flashback only; revealed to be alive}} {{g|Joins [[New U Technologies (Earth-616)|New U Technologies]]}}"
      );
    assert.equal(appearing[0].id, "Aleksei_Sytsevich_(Earth-616)");
    assert.equal(appearing[0].tags, "APPEARS AS,JOINS");
  });

  it("New way of appearing", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{a|[[Jessica Drew (Earth-616)|Spider-Woman (Jessica Drew) {{g|Cameo}}]]}}");
    assert.equal(appearing[0].id, "Jessica_Drew_(Earth-616)");
    assert.equal(appearing[0].tags, "CAMEO");
  });

  it("Some ref tag inside", function () {
    const appearing = new AppearingResolver().resolveAppearing(
      "* {{apn|[[Jessica Drew (Earth-616)|Spider-Woman (Jessica Drew)]]|Marvel Two-In-One #33|}}&lt;ref group=\"Flashback\"&gt;{{apn|[[Jessica Drew (Earth-616)|Jessica Drew]]|New Mutants Annual #4|Spider-Woman #37}}&lt;/ref&gt;"
    );
    assert.equal(appearing[0].id, "Jessica_Drew_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Simple but tricky end", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{a|[[Jessica Drew (Earth-616)|Spider-Woman (Jessica Drew)]]}}<ref group=\"Chronology\">'''Spider-Woman:'''");
    assert.equal(appearing[0].id, "Jessica_Drew_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Peter what's wrong", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{apn|[[Peter Parker (Earth-616)|Spider-Man (Peter Parker)]]|World War Hulk #2|Incredible Hulk Vol 2 109}}");
    assert.equal(appearing[0].id, "Peter_Parker_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Nicholas_Fury what's wrong", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{apn|[[Nicholas Fury (Earth-616)|Sgt. Nick Fury]]|Captain America - Nick Fury The Otherworld War Vol 1 1|Sgt Fury and his Howling Commandos Vol 1 92}}");
    assert.equal(appearing[0].id, "Nicholas_Fury_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Green instead of G", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{apn|[[Ulysses Klaw (Earth-616)|Klaw]]|Fantastic Four #187}} {{Green|Off Panel}}");
    assert.equal(appearing[0].id, "Ulysses_Klaw_(Earth-616)");
    assert.equal(appearing[0].tags, "OFF PANEL");
  });

  it("Custom tag but ignored", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{apn|[[Nicholas Fury (Earth-616)|Nick Fury]]||Marvel Fanfare #49}} {{g|[[#Chronology Notes|Seen in Flashback]]}}");
    assert.equal(appearing[0].id, "Nicholas_Fury_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Two characters in one line", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{a|[[Tyrone Johnson (Earth-616)|Cloak]]}} & {{a|[[Tandy Bowen (Earth-616)|Dagger]]}}");
    assert.equal(appearing[0].id, "Tyrone_Johnson_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
    assert.equal(appearing[1].id, "Tandy_Bowen_(Earth-616)");
    assert.isEmpty(appearing[1].tags);
  });

  it("Cut tags by semicolon", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{a|[[Aquaria Neptunia (Earth-616)|Namora]]}} {{g|Status undetermined; Reportedly deceased}}");
    assert.equal(appearing[0].id, "Aquaria_Neptunia_(Earth-616)");
    assert.equal(appearing[0].tags, "STATUS UNDETERMINED,REPORTEDLY DECEASED");
  });

  it("Cut tags by semicolon within g", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{Minor|Jane Foster (Earth-616)|Thor (Jane Foster)|Behind the scenes; texting}}");
    assert.equal(appearing[0].id, "Jane_Foster_(Earth-616)");
    assert.equal(appearing[0].tags, "MINOR,BEHIND THE SCENES,TEXTING");
  });

  it("g and ignored chronology notes", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{g|[[Johann Shmidt (Earth-616)|Red Skull (Johann Schmidt)]]|[[#Chronology Notes|Only in flashback]]}}");
    assert.equal(appearing[0].id, "Johann_Shmidt_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("if normal brackets - then treat it as tag", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{a|[[Anthony Stark (Earth-616)|Tony Stark]]}} (in Cryo-Chamber)");
    assert.equal(appearing[0].id, "Anthony_Stark_(Earth-616)");
    assert.equal(appearing[0].tags, "IN CRYO-CHAMBER");
  });

  it("Ignore overused circa", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{apn|[[Anthony Stark (Earth-616)|Iron Man]]|Tales of Suspense Vol 1 56|}} {{g|circa [[Avengers Vol 1 6|Avengers Vol 1 #6]]}}");
    assert.equal(appearing[0].id, "Anthony_Stark_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("Ignore things when space dash space", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{apn|[[Peter Parker (Earth-616)|Page 19, Panel 7]]|Amazing Spider-Man #15|Amazing Spider-Man #15}} - Peter is greeted by Liz Allen");
    assert.equal(appearing[0].id, "Peter_Parker_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
  });

  it("R appearance type", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{FlashOnly|[[Satan (Unidentified) (Earth-616)|\"Satan\"]]}}{{r|Official Handbook of the Marvel Universe A-Z Update #1|; [[Jefferson Archer (Earth-616)|Highwayman]]'s entry}}");
    assert.equal(appearing[0].id, "Satan_(Unidentified)_(Earth-616)");
    assert.equal(appearing[0].tags, "FLASHONLY");
  });

  it("Poster appearing problem", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{Poster|[[Thor Odinson (Earth-616)|Thor]]}}");
    assert.equal(appearing[0].id, "Thor_Odinson_(Earth-616)");
    assert.equal(appearing[0].tags, "POSTER");
  });

  it("Possessed as starting", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{possessed|[[Daniel Rand (Earth-616)|Iron Fist (Danny Rand)]]|[[Agamotto (Earth-616)|Agamotto]]}}");
    assert.equal(appearing[0].id, "Daniel_Rand_(Earth-616)");
    assert.equal(appearing[0].tags, "POSSESSED");
    assert.equal(appearing[1].id, "Agamotto_(Earth-616)");
    assert.equal(appearing[1].tags, "POSSESSES");
  });

  it("Voice as starting", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{Voice|[[Maria Hill (Earth-616)|Director Maria Hill]]}}");
    assert.equal(appearing[0].id, "Maria_Hill_(Earth-616)");
    assert.equal(appearing[0].tags, "VOICE");
  });

  it("Shared existence", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{apn|[[Thor Odinson (Earth-616)|Thor]]|Marvel Super-Heroes Vol 2 9}} {{g|Shared existence with {{apn|[[Eric Masterson (Earth-616)|Eric Masterson]]|Marvel Super-Heroes Vol 2 9|}}}}");
    assert.equal(appearing[0].id, "Thor_Odinson_(Earth-616)");
    assert.equal(appearing[0].tags, "SHARED EXISTENCE WITH");
    assert.equal(appearing[1].id, "Eric_Masterson_(Earth-616)");
    assert.equal(appearing[1].tags, "SHARED EXISTENCE WITH");
  });

  it("Shared line by dash", function () {
    const appearing = new AppearingResolver().resolveAppearing("** {{apn|[[Johann Shmidt (Earth-616)|Red Skull]]||-}} {{apn|[[Aleksander Lukin (Earth-616)|(Aleksander Lukin)]]|-|}}");
    assert.equal(appearing[0].id, "Johann_Shmidt_(Earth-616)");
    assert.isEmpty(appearing[0].tags);
    assert.equal(appearing[1].id, "Aleksander_Lukin_(Earth-616)");
    assert.isEmpty(appearing[1].tags);
  });

  it("First as after apn", function () {
    const appearing = new AppearingResolver().resolveAppearing("* {{apn|[[Carl Creel (Earth-616)|Absorbing Man]]|Daredevil Vol 1 1}} {{1stas|Absorbing Man}}");
    assert.equal(appearing[0].id, "Carl_Creel_(Earth-616)");
    assert.equal(appearing[0].tags, "1STAS");
  });

  it("Impersonate test", function () {
    const appearing = new AppearingResolver().resolveAppearing(
      "** {{1st|[[Raven Darkholme (Earth-13264)|Mystique (Raven Darkholme)]]}} {{Impersonates|{{Minor|[[Warren Worthington III (Earth-15513)|Ranger Worthington]]}}}}"
    );
    assert.equal(appearing[0].id, "Raven_Darkholme_(Earth-13264)");
    assert.equal(appearing[0].tags, "1ST,IMPERSONATES");
    assert.equal(appearing[1].id, "Warren_Worthington_III_(Earth-15513)");
    assert.equal(appearing[1].tags, "IMPERSONATED,MINOR");
  });
});