const UserFirebaseManager = require("./userFirebaseManager");

module.exports = class {
  #userFirebaseManager;
  #dbConnection;

  constructor(dbConnection) {
    this.#userFirebaseManager = new UserFirebaseManager();
    this.#dbConnection = dbConnection;
  };

  async createUserAccountAsync(userSingUpData) {
    const signUpResponse = await this.#userFirebaseManager.singUpInFirebaseAsync(userSingUpData);
    const userRecordCreationPromise = this.#createUserRecordAsync(signUpResponse.data);
    await this.#userFirebaseManager.setupDisplayName(signUpResponse.data, userSingUpData.userName);
    await userRecordCreationPromise;
    return signUpResponse;
  }

  async logInUserAsync(userSingInData) {
    const logInResponse = await this.#userFirebaseManager.logInFirebaseAsync(userSingInData);
    const logInData = logInResponse.data;
    const sessionData = {
      idToken: logInData.idToken,
      expirationDate: new Date().getTime() + (logInData.expiresIn * 1000),
      userName: logInData.displayName
    };
    await this.#dbConnection.updateAsync("users", { _id: logInData.localId }, { sessionData })
    return sessionData;
  }

  async tryToAutoLoginAsync(idToken) {
    const sessionData = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, { sessionData: 1 });
    if (sessionData && sessionData.sessionData.expirationDate >= new Date().getTime()) {
      return sessionData.sessionData;
    }
  }

  async logOutAsync(idToken) {
    await this.#dbConnection.updateAsync("users", { "sessionData.idToken": idToken }, { sessionData: {} });
  }

  #createUserRecordAsync = async function (userAuthData) {
    return this.#dbConnection.insertAsync("users", { _id: userAuthData.localId, issuesStatuses: [] });
  };
};