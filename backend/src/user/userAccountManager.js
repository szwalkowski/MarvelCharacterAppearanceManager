const UserAuthenticationManager = require("./userAuthenticationManager");

module.exports = class {
  #userAuthenticationManager;

  constructor() {
    this.#userAuthenticationManager = new UserAuthenticationManager();
  };

  async createUserAccountAsync(userSingUpData) {
    return await this.#userAuthenticationManager.singUpInFirebaseAsync(userSingUpData);
  }

  async logInUserAsync(userSingInData) {
    return await this.#userAuthenticationManager.logInFirebaseAsync(userSingInData);
  }
};