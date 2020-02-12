const express = require('express');
const CharacterController = require('./character/characterController');
const DictionariesController = require('./dictionaries/dictionariesController');
const IssueController = require('./issue/issueController');
const bodyParser = require('body-parser');
const server = express();
const MongoClient = require('./driver/mongoDriver');

class App {

  constructor(server) {
    const dbConnection = new MongoClient();
    this.#configureServerSettings(server);
    this.#createDataEndpoints(server, dbConnection);
    this.#startServer(server);
  }

  #configureServerSettings = function (server) {
    server.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next();
    });
    server.use(bodyParser.json());
  };

  #createDataEndpoints = function (server, dbConnection) {
    this.#indexEndpoint(server);
    new CharacterController(server, dbConnection);
    new DictionariesController(server, dbConnection);
    new IssueController(server);
  };

  #startServer = function (server) {
    server.listen(3000, () => {
      console.log('Server is up on port 3000');
    });
  };

  #indexEndpoint = function (server) {
    server.get('', (req, res) => {
      res.render('index');
    });
  }
}

new App(server);