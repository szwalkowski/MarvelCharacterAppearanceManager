const UserAccountManager = require("./userAccountManager");
const UserValidator = require("./userValidator");

module.exports = class {
  #userValidator;

  constructor(server, dbConnection) {
    this.#userValidator = new UserValidator();
    this.#createUserEndpoints(server, new UserAccountManager(dbConnection));
  };

  #createUserEndpoints = function (server, userAccountManager) {
    this.#prepareCreateAccount(server, userAccountManager);
    this.#prepareLogIn(server, userAccountManager);
    this.#prepareAutoLogIn(server, userAccountManager);
    this.#prepareLogOut(server, userAccountManager);
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
    })
  };

  #prepareLogIn = function (server, userAccountManager) {
    server.get("/logIn", (req, res) => {
      userAccountManager.logInUserAsync(JSON.parse(req.query.userSingInData)).then(response => {
        res.end(JSON.stringify(response));
      }, reason => {
        const errorMsg = reason.response && reason.response.data.error.message;
        if (errorMsg === "INVALID_PASSWORD" || errorMsg === "EMAIL_NOT_FOUND") {
          res.status(401);
          res.end(`Unauthorized`);
        } else {
          console.error(reason);
          res.status(500);
          res.end(`Error on login. ${reason.response && reason.response.data.error.message}`);
        }
      });
    });
  };

  #prepareAutoLogIn = function (server, userAccountManager) {
    server.get("/autoLogIn", async (req, res) => {
      const session = await userAccountManager.tryToAutoLoginAsync(req.query.idToken);
      res.end(JSON.stringify(session));
    });
  };

  #prepareLogOut = function (server, userAccountManager) {
    server.get("/logOut", async (req, res) => {
      userAccountManager.logOutAsync(req.query.idToken);
      res.end();
    });
  };
};