const UserAuthenticationManager = require("./userAuthenticationManager");

module.exports = class {
  #userAuthenticationManager;

  constructor() {
    this.#userAuthenticationManager = new UserAuthenticationManager();
  };

  async createUserAccountAsync(userSingUpData) {
    await this.#userAuthenticationManager.singUpInFirebaseAsync(userSingUpData);
  }
};