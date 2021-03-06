const express = require('express');
const helmet = require('helmet');
const path = require('path');
const CharacterController = require('./character/characterController');
const DictionaryController = require('./dictionary/dictionaryController');
const IssueController = require('./issue/issueController');
const IssueIgnoredController = require('./issue/issueIgnoredController');
const IssueFavouritesController = require('./issue/issueFavouritesController');
const IssueMassUpdateService = require('./issue/issueMassUpdateService');
const UserController = require('./user/userController');
const FeedController = require("./feed/feedController");
const AnalyticsController = require("./analyticsController");
const IssueManager = require("./issue/issueManager");
const UserAccountManager = require("./user/userAccountManager");
const bodyParser = require('body-parser');
const MongoClient = require('./driver/mongoDriver');

const server = express();

class App {

  constructor(server) {
    const dbConnection = new MongoClient();
    this.#configureServerSettings(server);
    this.#createDataEndpoints(server, dbConnection);
    this.#startServer(server);
  }

  #configureServerSettings = function (server) {
    server.use((req, res, next) => {
      //res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });
    server.use(bodyParser.json());
    server.use(helmet());
    const publicRoot = path.join(__dirname, "..", "dist");
    server.use(express.static(publicRoot));
    server.get("/", (req, res) => {
      res.sendFile("index.html", { root: publicRoot });
    });
  };

  #createDataEndpoints = function (server, dbConnection) {
    const userAccountManager = new UserAccountManager(dbConnection);
    const issueManager = new IssueManager(userAccountManager, dbConnection);
    const issueMassUpdateService = new IssueMassUpdateService(issueManager, dbConnection);
    const router = express.Router();
    new CharacterController(router, issueManager, userAccountManager, dbConnection);
    new DictionaryController(router, dbConnection, userAccountManager);
    new UserController(router, userAccountManager);
    new IssueController(router, issueManager, userAccountManager, issueMassUpdateService);
    new IssueIgnoredController(router, userAccountManager);
    new IssueFavouritesController(router, userAccountManager);
    new FeedController(router, userAccountManager, issueManager, dbConnection, issueMassUpdateService);
    new AnalyticsController(router, dbConnection);
    server.use("/api", router);
  };

  #startServer = function (server) {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is up on port ${process.env.PORT || 3000}`);
    });
  };
}

new App(server);