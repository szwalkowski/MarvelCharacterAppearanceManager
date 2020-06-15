const { extractIdToken } = require("../utils");

module.exports = class {

  constructor(server, userAccountManager) {
    this.#createUserEndpoints(server, userAccountManager);
  };

  #createUserEndpoints = function (server, userAccountManager) {
    this.#prepareLogIn(server, userAccountManager);
    this.#prepareLogOut(server, userAccountManager);
    this.#deleteUser(server, userAccountManager);
  };

  #prepareLogIn = function (server, userAccountManager) {
    server.post("/logIn", async (req, res) => {
      userAccountManager.tryToLoginAsync(req.body["idToken"])
        .then(session => {
          res.end(JSON.stringify(session));
        })
        .catch(err => {
          console.error(err);
          res.status(401);
          res.end("Invalid id token!");
        })
    });
  };

  #prepareLogOut = function (server, userAccountManager) {
    server.post("/logOut", async (req, res) => {
      userAccountManager.logOutAsync(req.body["idToken"]);
      res.status(204).end();
    });
  };

  #deleteUser = function (server, userAccountManager) {
    server.delete("/user", async (req, res) => {
      userAccountManager.deleteUserAsync(extractIdToken(req));
      res.status(204).end();
    });
  };
};