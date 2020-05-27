module.exports = class {
  #dbConnection;

  constructor(dbConnection) {
    this.#dbConnection = dbConnection;
  }

  async saveDictionaryAsync(dictionaryId, dictionaryContent) {
    this.#validateDictionaryId(dictionaryId);
    this.#validateDictionaryContent(dictionaryContent);
    dictionaryContent.forEach(record => {
      record.values = record.values.map(value => value.trim().toUpperCase());
      record.label = record.label.trim();
    });
    return this.#dbConnection.saveAsync("dictionaries", dictionaryId, { _id: dictionaryId, dictionary: dictionaryContent });
  };

  async getDictionaryByIdAsync(dictionaryId) {
    return this.#dbConnection.getByIdAsync("dictionaries", dictionaryId);
  };

  #validateDictionaryId = function (dictionaryId) {
    if (!dictionaryId) {
      throw new Error("Missing dictionary id!");
    }
    if (!["appearanceType", "focusType"].includes(dictionaryId)) {
      throw new Error("Unknown dictionary!")
    }
  }

  #validateDictionaryContent = function (dictionaryContent) {
    if (!dictionaryContent) {
      throw new Error("Missing dictionary content!");
    }
    const knownLabels = [];
    const knownValues = [];
    dictionaryContent.forEach(record => {
      if (!record.label) {
        throw new Error("Label must be defined!");
      }
      if (record.label.includes("_")) {
        throw new Error("Label can't contain underscore (_)!");
      }
      if (knownLabels.includes(record.label)) {
        throw new Error(`Label ${record.label} is already defined!`);
      }
      knownLabels.push(record.label);
      if (record.values) {
        record.values.forEach(value => {
          if (knownValues.includes(value)) {
            throw new Error(`Value ${value} is already defined!`);
          }
          knownValues.push(value);
        });
      }
    });
  }
};