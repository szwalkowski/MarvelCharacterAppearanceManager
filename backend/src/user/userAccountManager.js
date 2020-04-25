const UserFirebaseManager = require("./firebase/userFirebaseManager");

module.exports = class {
  #userFirebaseManager;
  #dbConnection;

  constructor(dbConnection) {
    this.#userFirebaseManager = new UserFirebaseManager();
    this.#dbConnection = dbConnection;
  };

  async tryToLoginAsync(idToken) {
    const verificationData = await this.verifyIdTokenAsync(idToken);
    if (!verificationData) {
      throw new Error("Could not verify id token!");
    }
    await this.#addSessionWithUserCreationAsync(verificationData);
    const user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, { _id: 1 });
    if (user) {
      return true;
    }
  }

  async logOutAsync(idToken) {
    await this.#dbConnection.updateAsync("users", { "sessionData.idToken": idToken }, { sessionData: {} });
  }

  async verifyIdTokenAsync(idToken) {
    const verificationData = await this.#userFirebaseManager.verifyIdTokenAsync(idToken);
    if (verificationData) {
      return {
        idToken,
        userId: verificationData.uid,
        userName: verificationData.name
      }
    }
  }

  async findUserByIdTokenAsync(idToken) {
    return this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken });
  }

  #addSessionWithUserCreationAsync = async function (sessionData) {
    const userInDb = await this.#dbConnection.findOneAsync("users", { _id: sessionData.userId }, { _id: 1 });
    if (userInDb) {
      return this.#dbConnection.updateAsync("users", { _id: sessionData.userId }, { sessionData });
    } else {
      return this.#dbConnection.insertAsync("users", { _id: sessionData.userId, sessionData, issuesStatuses: [] });
    }
  };
};