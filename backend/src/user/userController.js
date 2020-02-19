const UserAccountManager = require("./userAccountManager");
const UserValidator = require("./userValidator");

module.exports = class {
  #userValidator;

  constructor(server) {
    this.#userValidator = new UserValidator();
    this.#createUserEndpoints(server, new UserAccountManager());
  };

  #createUserEndpoints = function (server, userAccountManager) {
    this.#prepareCreateAccount(server, userAccountManager);
  };

  #prepareCreateAccount = function (server, userAccountManager) {
    server.post("/createAccount", (req, res) => {
      const userSingUpData = req.body["userSingUpData"];
      const error = this.#userValidator.checkUserSingUpData(userSingUpData);
      if (error) {
        res.status(400);
        res.end(error);
        return;
      }
      userAccountManager.createUserAccountAsync(userSingUpData).then(() => {
        res.end();
      }, reason => {
        console.error(reason);
        res.status(500);
        res.end(`Error on creating user account. ${reason.response && reason.response.data.error.message}`);
      });
    });
  };
};