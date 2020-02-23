const UserFirebaseManager = require("./firebase/userFirebaseManager");

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
    await this.#userFirebaseManager.setupDisplayNameAsync(signUpResponse.data, userSingUpData.userName);
    await userRecordCreationPromise;
    return signUpResponse;
  }

  async logInUserAsync(userSingInData) {
    const logInResponse = await this.#userFirebaseManager.logInFirebaseAsync(userSingInData);
    const logInData = logInResponse.data;
    if (!await this.#checkIfUserHasConfirmedEmailAsync(logInData.localId, logInData.idToken)) {
      return {
        message: "Please confirm your email first"
      };
    }
    const sessionData = {
      idToken: logInData.idToken,
      expirationDate: new Date().getTime() + parseInt(logInData.expiresIn) * 1000,
      userName: logInData.displayName,
      doNotLogOut: userSingInData.doNotLogOut,
      refreshToken: logInData.refreshToken,
      sessionType: "email"
    };
    this.#addNewSessionToDbAsync(logInData.localId, sessionData);
    return {
      idToken: sessionData.idToken,
      userName: sessionData.userName,
      doNotLogOut: sessionData.doNotLogOut
    };
  }

  async tryToAutoLoginAsync(idToken) {
    const user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken });
    if (user && user.sessionData.expirationDate >= new Date().getTime()) {
      return {
        idToken: user.sessionData.idToken,
        userName: user.sessionData.userName,
        doNotLogOut: user.sessionData.doNotLogOut
      };
    } else if (user && user.sessionData.doNotLogOut) {
      return await this.#refreshTokenAsync(user);
    }
  }

  async logOutAsync(idToken) {
    await this.#dbConnection.updateAsync("users", { "sessionData.idToken": idToken }, { sessionData: {} });
  }

  async verifyIdTokenAsync(idToken, sessionType) {
    const verificationData = await this.#userFirebaseManager.verifyIdTokenAsync(idToken);
    if (verificationData) {
      this.#addSessionWithUserCreationAsync(idToken, sessionType, verificationData);
      return {
        idToken: idToken,
        userName: verificationData.name,
        doNotLogOut: false
      }
    }
  }

  #refreshTokenAsync = async function (user) {
    const refreshResponse = await this.#userFirebaseManager.refreshIdTokenAsync(user.sessionData.refreshToken);
    if (refreshResponse.status === 200 && refreshResponse.data.id_token) {
      const refreshData = refreshResponse.data;
      this.#addNewSessionToDbAsync(refreshData.user_id, {
        idToken: refreshData.id_token,
        expirationDate: new Date().getTime() + parseInt(refreshData.expires_in) * 1000,
        userName: user.sessionData.userName,
        doNotLogOut: false,
        refreshToken: user.sessionData.refreshToken
      });
      return {
        idToken: refreshData.id_token,
        userName: user.sessionData.userName,
        doNotLogOut: false
      };
    }
  };

  #addSessionWithUserCreationAsync = async function (tokenId, sessionType, verificationData) {
    const userInDb = await this.#dbConnection.findOneAsync("users", { _id: verificationData.user_id });
    const sessionData = { idToken: tokenId, expirationDate: verificationData.exp, userName: verificationData.name, sessionType };
    if (userInDb) {
      return this.#addNewSessionToDbAsync(verificationData.user_id, { sessionData })
    } else {
      return this.#dbConnection.insertAsync("users", { _id: verificationData.user_id, sessionData, issuesStatuses: [] });
    }
  };

  #addNewSessionToDbAsync = async function (userId, sessionData) {
    return this.#dbConnection.updateAsync("users", { _id: userId }, { sessionData });
  };

  #createUserRecordAsync = async function (userAuthData) {
    return this.#dbConnection.insertAsync("users", { _id: userAuthData.localId, issuesStatuses: [] });
  };

  #checkIfUserHasConfirmedEmailAsync = async function (userId, idToken) {
    const userInDb = await this.#dbConnection.findOneAsync("users", { _id: userId });
    if (userInDb.hasConfirmedEmail) {
      return true;
    }
    const responseUserData = await this.#userFirebaseManager.getUserDataAsync(idToken);
    const user = responseUserData.data.users.find(user => user.localId === userId);
    if (user.emailVerified) {
      this.#dbConnection.updateAsync("users", { _id: userId }, { hasConfirmedEmail: true });
      return true;
    }
  }
};