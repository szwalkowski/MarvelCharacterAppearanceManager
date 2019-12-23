const path = require('path');
const express = require('express');
const server = express();

configureServerSettings(server);
server.get('', (req, res) => {
    res.render('index');
});
startServer(server);

function configureServerSettings(server) {
    const publicDirectoryPath = path.join(__dirname, '../public/');
    const viewDirectoryPath = path.join(__dirname, '../views/');
    server.set('view engine', 'hbs');
    server.set('views', viewDirectoryPath);
    server.use(express.static(publicDirectoryPath));
}

function startServer(server) {
    server.listen(3000, () => {
        console.log('Server is up on port 3000');
    });
}