const fs = require('fs');

let DictionariesManager = function () {
};

DictionariesManager.prototype.saveDictionary = async function saveDictionary(dictionaryId, dictionaryContent) {
    const dictionaryContentAsString = JSON.stringify(dictionaryContent);
    const fileName = `../database/dictionaries/${dictionaryId}Dictionary.json`;
    await fs.writeFile(fileName, dictionaryContentAsString, function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
    })
};

DictionariesManager.prototype.getDictionaryById = function (dictionaryId) {
    const fileContent = fs.readFileSync(`../database/dictionaries/${dictionaryId}Dictionary.json`, "utf-8");
    return JSON.parse(fileContent);
};

module.exports = DictionariesManager;