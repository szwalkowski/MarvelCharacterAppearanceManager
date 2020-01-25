const express = require('express');
const CharacterController = require('./character/characterController');
const DictionariesController = require('./dictionaries/dictionariesController');
const IssueController = require('./issue/issueController');
const bodyParser = require('body-parser');
const server = express();

configureServerSettings(server);
createDataEndpoints(server);
startServer(server);

function configureServerSettings(server) {
    server.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        next();
    });
    server.use(bodyParser.json());
}

function createDataEndpoints(server) {
    indexEndpoint(server);
    new CharacterController().setupEndpoints(server);
    new DictionariesController().setupEndpoints(server);
    new IssueController().setupEndpoints(server);
}

function indexEndpoint(server) {
    server.get('', (req, res) => {
        res.render('index');
    });
}

function startServer(server) {
    server.listen(3000, () => {
        console.log('Server is up on port 3000');
    });
}