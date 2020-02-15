module.exports = class {
  translateUsingDictionary(word, dictionary, omitHidden = false) {
    for (const record of dictionary) {
      if (record.values.indexOf(word.toUpperCase()) > -1) {
        if (!omitHidden || record.label !== '-hide-') {
          return record.label;
        } else {
          return "";
        }
      }
    }
    return word;
  };

  translateArrayUsingDictionary(array, dictionary, omitHidden = false) {
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
};