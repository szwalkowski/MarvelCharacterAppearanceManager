const IssueManager = require('./issueManager');

const IssueController = function () {
    this.issueManager = new IssueManager();
};

IssueController.prototype.setupEndpoints = function (server) {
    prepareMarkAsReadEndpoint(this, server);
};

function prepareMarkAsReadEndpoint(instance, server) {
    server.post("/markIssueAsRead", (req, res) => {
        instance.issueManager.markIssueAsReadAsync(req.body["issueId"], req.body["characterAlias"], req.body["characterUniverse"]).then(response => {
            res.end(response);
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on marking as read an issue");
        });
    });
}

module.exports = IssueController;