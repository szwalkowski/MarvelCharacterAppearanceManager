const DictionariesRepository = require('./dictionariesRepository');

module.exports = class {
  #dictionariesRepository;

  constructor(dbConnection) {
    this.#dictionariesRepository = new DictionariesRepository(dbConnection);
  }

  async saveDictionaryAsync(dictionaryId, dictionaryContent) {
    dictionaryContent.forEach(record => {
      record.values = record.values.map(value => value.toUpperCase());
    });
    this.#dictionariesRepository.saveDictionaryAsync(dictionaryId, { _id: dictionaryId, dictionary: dictionaryContent });
  };

  async getDictionaryByIdAsync(dictionaryId) {
    return this.#dictionariesRepository.getAsync(dictionaryId);
  };
};