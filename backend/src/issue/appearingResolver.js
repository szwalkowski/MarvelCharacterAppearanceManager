// From here: https://marvel.fandom.com/wiki/Marvel_Database:Appearance_Tags
const SECTION_CUTTER_CURLY = /{|}|\*|'{3}|<.*>|&LT;.*&GT;/i;
const SECTION_CUTTER_SQUARE = /[\[|\]]/;
const TAGS_TO_IGNORE = /^(Chronology|#Chronology Notes|ChronoFB|Topical Reference| - | & |Circa|#Continuity Notes| - .+|r\|.*)$/i;
const TAGS_WITH_CONTINUATION = ["A", "G", "GREEN", "MINOR", "MENTIONED", "FB"];
const TAG_WITH_CONTINUATION_REGEX = /^(a|g|green|Minor|Mentioned|FB)\|/i;
const TAGS_WITHOUT_CONTINUATION = [
  "APN", "1ST", "1ST REAL NAME", "1STAS", "1STCHRON", "1STFULL", "1STHIST", "APDEATH", "CAMEO", "DEATH", "DEFUNCT", "DESTROYED", "DESTRUCTION", "DISBANDS",
  "FINAL", "FINAL DIES", "FLASHBACK", "FLASHBACK AND FLASHFORWARD", "FLASHFORWARD", "FLASHONLY", "GHOST", "JOINS", "LAST", "LEAVES", "ONLY", "ONLY DIES",
  "ONSCREEN", "ORIGIN", "REBIRTH", "RECAP", "REPAIRED", "RESURRECTION", "SHADOW", "UNNAMED", "BTS", "CARVING", "CORPSE", "DRAWING", "DREAM", "ILLUSION",
  "ONSCREENONLY", "PHOTO", "POSTER", "RECAPONLY", "STATUE", "TOY", "VISION", "VOICE", "INVOKED", "DECEASED", "SCREEN", "HOLOGRAM"];
const TAG_WITHOUT_CONTINUATION_REGEX
  = /^(Apn|1st|1st Real Name|1stas|1stChron|1stFull|1stHist|ApDeath|Cameo|Death|Defunct|Destroyed|Destruction|Disbands|Final|Final Dies|Flashback|Flashback and Flashforward|Flashforward|FlashOnly|Ghost|Joins|Last|Leaves|Only|Only Dies|OnScreen|Origin|Rebirth|Recap|Repaired|Resurrection|Shadow|Unnamed|BTS|Carving|Corpse|Drawing|Dream|Illusion|OnScreenOnly|Photo|Poster|RecapOnly|Statue|Toy|Vision|Voice|Invoked|Deceased|Screen|Hologram)\|/i;
const TAG_FOR_POSSESSED_BY = /^g\|Possessed by $/i;
const TAG_FOR_SHARED_EXISTENCE_WITH = /^g\|Shared existence with $/i;
const TAG_FOR_POSSESSED_V2 = /^Possessed\|/i
const TAG_FOR_CUSTOM_BUT_AFTER = /^(g\||green\|)/i;
const TAG_FOR_IMPERSONATION_BY = /^Impersonates[| ]/i;

module.exports = class {

  resolveAppearing(appearingLine) {
    const appearing = [{ tags: [] }];
    let appearingUnderChange = 0;
    const sections = appearingLine.split(SECTION_CUTTER_CURLY).filter(section => section.trim());
    for (const section of sections) {
      if (TAGS_TO_IGNORE.test(section)) {
        continue;
      } else if (appearing[appearingUnderChange].id && TAG_FOR_POSSESSED_BY.test(section)) {
        appearing[appearingUnderChange].tags.push("POSSESSED");
        appearing.push({ tags: [] });
        appearing[++appearingUnderChange].tags.push("POSSESSES");
      } else if (appearing[appearingUnderChange].id && TAG_FOR_SHARED_EXISTENCE_WITH.test(section)) {
        appearing[appearingUnderChange].tags.push("SHARED EXISTENCE WITH");
        appearing.push({ tags: [] });
        appearing[++appearingUnderChange].tags.push("SHARED EXISTENCE WITH");
      } else if (!appearing[appearingUnderChange].id && sections.length === 1 && TAG_FOR_POSSESSED_V2.test(section)) {
        this.#createPossessionCombo(section, appearing, appearingUnderChange);
      } else if (appearing[appearingUnderChange].id && TAG_FOR_IMPERSONATION_BY.test(section)) {
        appearing[appearingUnderChange].tags.push("IMPERSONATES");
        ++appearingUnderChange;
        appearing.push({
          id: section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim())[1].replace(/ /g, "_"),
          tags: ["IMPERSONATED"]
        });
      } else if (appearing[appearingUnderChange].id && TAG_FOR_CUSTOM_BUT_AFTER.test(section)) {
        this.#extractTagForAppearingAfterCustom(section, appearing[appearingUnderChange]);
      } else if (appearing[appearingUnderChange].id && TAG_WITH_CONTINUATION_REGEX.test(section)) {
        appearing.push({ tags: [] });
        this.#createAppearingWithContinuation(section, appearing[++appearingUnderChange]);
      } else if (TAG_WITH_CONTINUATION_REGEX.test(section)) {
        this.#createAppearingWithContinuation(section, appearing[appearingUnderChange]);
      } else if (TAG_WITHOUT_CONTINUATION_REGEX.test(section)) {
        this.#createAppearingWithoutContinuation(section, appearing[appearingUnderChange]);
      } else {
        this.#createTagsForAppearing(section, appearing[appearingUnderChange]);
      }
    }
    return appearing.filter(app => app.id && app.id.endsWith(")"));
  };

  #createPossessionCombo = function(section, appearing) {
    const possessSections = section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim());
    appearing[0].id = possessSections[1].replace(/ +/g, "_");
    appearing[0].tags.push("POSSESSED");
    appearing.push({ tags: [] });
    appearing[1].tags.push("POSSESSES");
    appearing[1].id = possessSections[3].replace(/ +/g, "_");
  }

  #extractTagForAppearingAfterCustom = function(section, appearing) {
    const sectionSplit = section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim());
    if (sectionSplit.length > 1) {
      const tag = sectionSplit[1].trim().toUpperCase();
      if (!TAGS_TO_IGNORE.test(tag)) {
        appearing.tags.push(...tag.split(/;/).filter(section => section.trim()).map(t => t.trim()));
      }
    }
  }

  #createAppearingWithContinuation = function (section, appearing) {
    const sections = section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim());
    if (sections.length === 1) {
      appearing.tags.push(sections[0].trim().toUpperCase());
    } else {
      const sectionTag = sections[0].trim().toUpperCase();
      if (TAGS_WITH_CONTINUATION.includes(sectionTag)) {
        appearing.id = sections[1].replace(/ +/g, "_");
        if (sectionTag !== "A" && sectionTag !== "G" && sectionTag !== "GREEN") {
          appearing.tags.push(sectionTag);
        }
        if (sections.length > 2 && sections[3]) {
          if (TAG_FOR_IMPERSONATION_BY.test(sections[3])) {
            appearing.tags.push("IMPERSONATES");
          } else {
            if (!TAGS_TO_IGNORE.test(sections[3])) {
              appearing.tags.push(...sections[3].split(/;/).filter(section => section.trim()).map(t => t.trim().toUpperCase()));
            }
          }
        }
      }
    }
  };

  #createAppearingWithoutContinuation = function (section, appearing) {
    const sections = section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim());
    if (sections.length === 1) {
      appearing.tags.push(sections[0].trim().toUpperCase());
    } else {
      const sectionTag = sections[0].trim().toUpperCase();
      if (TAGS_WITHOUT_CONTINUATION.includes(sectionTag)) {
        appearing.id = sections[1].replace(/ /g, "_");
        if (sectionTag !== "APN") {
          appearing.tags.push(sectionTag);
        }
      }
    }
  };

  #createTagsForAppearing = function (section, appearing) {
    const sections = section.split(SECTION_CUTTER_SQUARE).filter(section => section.trim());
    if (sections.length && !sections[0].endsWith(":")) {
      appearing.tags.push(sections[0].replace(/[()]/g, "").trim().toUpperCase());
    }
  };
}