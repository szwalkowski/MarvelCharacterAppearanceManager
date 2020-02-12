const MongoClient = require("mongodb").MongoClient;

module.exports = class {
  #connection;

  constructor() {
    const ip = process.env.MCAM_DB_IP;
    const port = process.env.MCAM_DB_PORT;
    const user = process.env.MCAM_DB_USER;
    const pwd = process.env.MCAM_DB_PWD;
    const dbName = process.env.MCAM_DB_NAME;
    const uri = `mongodb://${user}:${pwd}@${ip}:${port}/${dbName}?retryWrites=true&w=majority`;
    MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .connect()
      .then(connection => {
        console.log("Connected to Mongo");
        this.#connection = connection;
      })
      .catch(err => {
        console.error(err);
      });
  }

  db() {
    return this.#connection.db();
  }
};