const IssueManager = require('./issueManager');

const IssueController = function () {
    this.issueManager = new IssueManager();
};

IssueController.prototype.setupEndpoints = function (server) {
    prepareMarkAsReadEndpoint(this, server);
    prepareUnmarkAsReadEndpoint(this, server);
};

function prepareMarkAsReadEndpoint(instance, server) {
    server.post("/markIssueAsRead", (req, res) => {
        instance.issueManager.markIssueAsReadAsync(req.body["issueId"], req.body["characterAlias"], req.body["characterUniverse"]).then(response => {
            res.end(JSON.stringify({issueId: req.body["issueId"], readTime: response}));
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on marking as read an issue");
        });
    });
}

function prepareUnmarkAsReadEndpoint(instance, server) {
    server.post("/unmarkIssueAsRead", (req, res) => {
        instance.issueManager.markIssueAsNotReadAsync(req.body["issueId"], req.body["characterAlias"], req.body["characterUniverse"]).then(() => {
            res.end(JSON.stringify({issueId: req.body["issueId"]}));
        }, reason => {
            console.error(reason);
            res.status(500);
            res.end("Error on marking as read an issue");
        });
    });
}

module.exports = IssueController;