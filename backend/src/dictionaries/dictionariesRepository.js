module.exports = class {
  #dbConnection;

  constructor(dbConnection) {
    this.#dbConnection = dbConnection;
  }

  async getAsync(dictionaryId) {
    return await this.#dbConnection
      .db()
      .collection("dictionaries")
      .findOne({ _id: dictionaryId });
  }

  async saveDictionaryAsync(dictionaryId, dictionary) {
    await this.#dbConnection
      .db()
      .collection("dictionaries")
      .updateOne({ _id: dictionaryId }, { $set: dictionary });
  }
};