module.exports = class {
  #dbConnection;

  constructor(dbConnection) {
    this.#dbConnection = dbConnection;
  }

  async saveDictionaryAsync(dictionaryId, dictionaryContent) {
    dictionaryContent.forEach(record => {
      record.values = record.values.map(value => value.toUpperCase());
    });
    return this.#dbConnection.saveAsync("dictionaries", dictionaryId, { _id: dictionaryId, dictionary: dictionaryContent });
  };

  async getDictionaryByIdAsync(dictionaryId) {
    return this.#dbConnection.getByIdAsync("dictionaries", dictionaryId);
  };
};