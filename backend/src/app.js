const express = require('express');
const CharacterController = require('./character/characterController');
const DictionaryController = require('./dictionary/dictionaryController');
const IssueController = require('./issue/issueController');
const UserController = require('./user/userController');
const IssueManager = require("./issue/issueManager");
const UserAccountManager = require("./user/userAccountManager");
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
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });
    server.use(bodyParser.json());
  };

  #createDataEndpoints = function (server, dbConnection) {
    this.#indexEndpoint(server);
    const userAccountManager = new UserAccountManager(dbConnection);
    const issueManager = new IssueManager(userAccountManager, dbConnection);
    new CharacterController(server, issueManager, userAccountManager, dbConnection);
    new DictionaryController(server, dbConnection);
    new UserController(server, userAccountManager);
    new IssueController(server, issueManager, userAccountManager);
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