const MongoClient = require("mongodb").MongoClient;

module.exports = class {
  #connection;

  constructor() {
    const ip = process.env.MCAM_DB_IP;
    const port = process.env.MCAM_DB_PORT;
    const user = process.env.MCAM_DB_USER;
    const pwd = process.env.MCAM_DB_PWD;
    const dbName = process.env.MCAM_DB_NAME;
    const uri = `mongodb${port ? '' : '+srv'}://${user}:${pwd}@${ip}${port ? ':' + port : ''}/${dbName}?retryWrites=true&w=majority`;
    MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .connect()
      .then(connection => {
        console.log("Connected to Mongo");
        this.#connection = connection;
      })
      .catch(err => {
        console.error("Error connecting mongo.", err);
      });
  }

  db() {
    return this.#connection.db();
  }

  async getByIdAsync(collection, id) {
    return this
      .db()
      .collection(collection)
      .findOne({ _id: id });
  }

  async saveAsync(collection, id, document) {
    return this
      .db()
      .collection(collection)
      .updateOne({ _id: id }, { $set: document }, { upsert: true });
  }

  async insertAsync(collection, document) {
    return this
      .db()
      .collection(collection)
      .insertOne(document);
  }

  async findAsync(collection, query, projection) {
    return this
      .db()
      .collection(collection)
      .find(query)
      .project(projection);
  }

  async findOneAsync(collection, query, projection = {}) {
    return this
      .db()
      .collection(collection)
      .findOne(query, { projection })
  }

  async updateAsync(collection, query, updateData) {
    return this
      .db()
      .collection(collection)
      .updateOne(query, { $set: updateData });
  }

  async deleteAsync(collection, query) {
    return this
      .db()
      .collection(collection)
      .deleteOne(query);
  }

  async addToSet(collection, query, setName, elements) {
    return this
      .db()
      .collection(collection)
      .updateOne(query, { $addToSet: { [setName]: { $each: elements } } });
  }

  async pull(collection, query, field, value) {
    return this
      .db()
      .collection(collection)
      .updateOne(query, { $pull: { [field]: value } });
  }

  async aggregateAsync(collection, pipeline, options) {
    return this
      .db()
      .collection(collection)
      .aggregate(pipeline, options);
  }
};