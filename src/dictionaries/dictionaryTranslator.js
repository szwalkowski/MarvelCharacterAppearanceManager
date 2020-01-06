const DictionaryTranslator = function () {

};

DictionaryTranslator.prototype.translateArrayUsingDictionary = function (array, dictionary, omitHidden = false) {
    const translatedSet = new Set();
    array.forEach(word => {
        let foundLabel = false;
        for (const record of dictionary) {
            if (record.values.indexOf(word.toUpperCase()) > -1) {
                if (!omitHidden || record.label !== '-hide-') {
                    translatedSet.add(record.label);
                }
                foundLabel = true;
                break;
            }
        }
        if (!foundLabel) {
            translatedSet.add(word);
        }
    });
    return [...translatedSet];
};

module.exports = DictionaryTranslator;