const express = require('express');
const CharacterController = require('./character/characterController');
const DictionariesController = require('./dictionaries/dictionariesController');
const IssueController = require('./issue/issueController');
const bodyParser = require('body-parser');
const server = express();

class App {

  constructor(server) {
    this.#configureServerSettings(server);
    this.#createDataEndpoints(server);
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

  #createDataEndpoints = function (server) {
    this.#indexEndpoint(server);
    new CharacterController(server);
    new DictionariesController(server);
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