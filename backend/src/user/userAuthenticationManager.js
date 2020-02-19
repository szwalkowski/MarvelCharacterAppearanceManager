const axios = require("axios");

module.exports = class {
  #axios;

  constructor() {
    this.#axios = axios.create({
      baseURL: "https://identitytoolkit.googleapis.com/v1/"
    });
  }

  async singUpInFirebaseAsync(userSingUpData) {
    return await this.#axios
      .post(`accounts:signUp?key=${process.env.FIREBASE_API_KEY}`, {
        email: userSingUpData.email,
        password: userSingUpData.password,
        returnSecureToken: true
      });
  }

  async logInFirebaseAsync(userSingUpData) {
    return await this.#axios
      .post(`accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
        email: userSingUpData.email,
        password: userSingUpData.password,
        returnSecureToken: true
      });
  }

};