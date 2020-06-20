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
    const isAdmin = user._id === process.env.ADMIN_USER_ID;
    if (user) {
      return {
        id: user._id,
        userType: isAdmin ? "Admin" : "User"
      };
    }
  }

  async logOutAsync(idToken) {
    await this.#dbConnection.updateAsync("users", { "sessionData.idToken": idToken }, { sessionData: {} });
  }

  async deleteUserAsync(idToken) {
    if (!idToken) {
      throw new Error("Missing idToken!");
    }
    await this.#dbConnection.deleteAsync("users", { "sessionData.idToken": idToken });
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
    let user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken });
    if (!user) {
      user = await this.#tryRelogAsync(idToken);
    }
    return user;
  }

  async findUserIgnoredIssuesAsync(idToken) {
    let user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, { _id: 0, ignored: 1 });
    if (!user) {
      user = await this.#tryRelogAsync(idToken, { _id: 0, ignored: 1 });
    }
    return user;
  }

  async markIssueAsIgnoredAsync(idToken, issueId) {
    let user = await this.#dbConnection.addToSet("users", { "sessionData.idToken": idToken }, "ignored", [issueId]);
    if (!user) {
      user = await this.#tryRelogAsync(idToken);
      await this.#dbConnection.addToSet("users", { "sessionData.idToken": user.sessionData.idToken }, "ignored", [issueId]);
    }
  }

  async removeIssueFromIgnoredAsync(idToken, issueId) {
    let user = await this.#dbConnection.pull("users", { "sessionData.idToken": idToken }, "ignored", issueId);
    if (!user) {
      user = await this.#tryRelogAsync(idToken);
      await this.#dbConnection.pull("users", { "sessionData.idToken": user.sessionData.idToken }, "ignored", issueId);
    }
  }

  async findUserFavouritesIssuesAsync(idToken) {
    let user = await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, { _id: 0, favourites: 1 });
    if (!user) {
      user = await this.#tryRelogAsync(idToken, { _id: 0, favourites: 1 });
    }
    return user;
  }

  async markIssueAsFavouriteAsync(idToken, issueId) {
    let user = await this.#dbConnection.addToSet("users", { "sessionData.idToken": idToken }, "favourites", [issueId]);
    if (!user) {
      user = await this.#tryRelogAsync(idToken);
      await this.#dbConnection.addToSet("users", { "sessionData.idToken": user.sessionData.idToken }, "favourites", [issueId]);
    }
  }

  async removeIssueFromFavouriteAsync(idToken, issueId) {
    let user = await this.#dbConnection.pull("users", { "sessionData.idToken": idToken }, "favourites", issueId);
    if (!user) {
      user = await this.#tryRelogAsync(idToken);
      await this.#dbConnection.pull("users", { "sessionData.idToken": user.sessionData.idToken }, "ignored", issueId);
    }
  }

  async isAdminLoggedAsync(idToken) {
    if (!idToken) {
      return false;
    }
    let user = await this.#dbConnection.findOneAsync("users", { _id: process.env.ADMIN_USER_ID, "sessionData.idToken": idToken }, { _id: 1 });
    if (!user) {
      user = (await this.#tryRelogAsync(idToken, { _id: 1 }))._id === process.env.ADMIN_USER_ID;
    }
    return !!user;
  }

  #tryRelogAsync = async function(idToken, projection) {
    const verificationData = await this.verifyIdTokenAsync(idToken);
    if (!verificationData) {
      throw new Error("Could not verify id token!");
    }
    await this.#addSessionWithUserCreationAsync(verificationData);
    return await this.#dbConnection.findOneAsync("users", { "sessionData.idToken": idToken }, projection);
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