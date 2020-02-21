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
      expirationDate: new Date().getTime() + parseInt(logInData.expiresIn) * 1000,
      userName: logInData.displayName,
      doNotLogOut: userSingInData.doNotLogOut,
      refreshToken: logInData.refreshToken
    };
    this.#addNewSessionToDbAsync(logInData.localId, sessionData);
    return {
      idToken: sessionData.idToken,
      userName: sessionData.userName,
      doNotLogOut: sessionData.doNotLogOut
    };
  }

  async tryToAutoLoginAsync(idToken) {
    const user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, { sessionData: 1 });
    if (user && user.sessionData.expirationDate >= new Date().getTime()) {
      return {
        idToken: user.sessionData.idToken,
        userName: user.sessionData.userName,
        doNotLogOut: user.sessionData.doNotLogOut
      };
    } else if (user.sessionData.doNotLogOut) {
      return await this.#refreshTokenAsync(user);
    }
  }

  async logOutAsync(idToken) {
    await this.#dbConnection.updateAsync("users", { "sessionData.idToken": idToken }, { sessionData: {} });
  }

  #refreshTokenAsync = async function (user) {
    const refreshResponse = await this.#userFirebaseManager.refreshIdToken(user.sessionData.refreshToken);
    if (refreshResponse.status === 200 && refreshResponse.data.id_token) {
      const refreshData = refreshResponse.data;
      this.#addNewSessionToDbAsync(refreshData.user_id, {
        idToken: refreshData.id_token,
        expirationDate: new Date().getTime() + parseInt(refreshData.expires_in) * 1000,
        userName: user.sessionData.userName,
        doNotLogOut: true,
        refreshToken: user.sessionData.refreshToken
      });
      return {
        idToken: refreshData.id_token,
        userName: user.sessionData.userName,
        doNotLogOut: true
      };
    }
  };

  #addNewSessionToDbAsync = async function (userId, sessionData) {
    return this.#dbConnection.updateAsync("users", { _id: userId }, { sessionData });
  };

  #createUserRecordAsync = async function (userAuthData) {
    return this.#dbConnection.insertAsync("users", { _id: userAuthData.localId, issuesStatuses: [] });
  };
};