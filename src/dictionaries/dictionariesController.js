const DictionaryManager = require('./dictionariesManager');

let DictionariesController = function () {
    this.dictionaryManager = new DictionaryManager();
};

DictionariesController.prototype.setupEndpoints = function (server) {
    createDictionaryEndpoints(this, server);
};

function createDictionaryEndpoints(instance, server) {
    prepareGetDictionary(instance, server);
    prepareSaveDictionary(instance, server);
}

function prepareGetDictionary(instance, server) {
    server.get("/getDictionary", (req, res) => {
        const data = instance.dictionaryManager.getDictionaryById(req.query.dictionaryId);
        res.end(JSON.stringify(data));
    });
}

function prepareSaveDictionary(instance, server) {
    server.post("/saveDictionary", (req, res) => {
        instance.dictionaryManager.saveDictionaryAsync(req.body["dictionaryId"], req.body["dictionaryContent"]).then(() => {
            res.end();
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on saving dictionary");
        });
    });
}

module.exports = DictionariesController;