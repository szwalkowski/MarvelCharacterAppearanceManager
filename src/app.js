const path = require('path');
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
    const publicDirectoryPath = path.join(__dirname, '../public/');
    const viewDirectoryPath = path.join(__dirname, '../views/');
    server.set('view engine', 'hbs');
    server.set('views', viewDirectoryPath);
    server.use(express.static(publicDirectoryPath));
    server.use(bodyParser.urlencoded({ extended: true }));
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