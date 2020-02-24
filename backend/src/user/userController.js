const UserValidator = require("./userValidator");

module.exports = class {
  #userValidator;

  constructor(server, userAccountManager) {
    this.#userValidator = new UserValidator();
    this.#createUserEndpoints(server, userAccountManager);
  };

  #createUserEndpoints = function (server, userAccountManager) {
    this.#prepareCreateAccount(server, userAccountManager);
    this.#prepareLogIn(server, userAccountManager);
    this.#prepareAutoLogIn(server, userAccountManager);
    this.#prepareLogOut(server, userAccountManager);
    this.#prepareGoogleTokenVerification(server, userAccountManager);
    this.#prepareResendVerificationEmail(server, userAccountManager);
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
    server.post("/logIn", (req, res) => {
      userAccountManager.logInUserAsync(req.body["userSingInData"]).then(response => {
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
    server.post("/autoLogIn", async (req, res) => {
      const session = await userAccountManager.tryToAutoLoginAsync(req.body["idToken"]);
      res.end(JSON.stringify(session));
    });
  };

  #prepareLogOut = function (server, userAccountManager) {
    server.post("/logOut", async (req, res) => {
      userAccountManager.logOutAsync(req.body["idToken"]);
      res.end();
    });
  };

  #prepareGoogleTokenVerification = function (server, userAccountManager) {
    server.post("/verifyGoogleTokenId", async (req, res) => {
      const result = await userAccountManager.verifyIdTokenAsync(req.body["idToken"], req.body["sessionType"]);
      res.end(JSON.stringify(result));
    });
  };

  #prepareResendVerificationEmail = function (server, userAccountManager) {
    server.post("/resendVerificationEmail", (req, res) => {
      userAccountManager.resendVerificationEmailAsync(req.body["userSingInData"]).then(response => {
        if (response && response.code === 400) {
          res.status(500);
          res.end(JSON.stringify(response));
        } else {
          res.end();
        }
      });
    });
  };
};