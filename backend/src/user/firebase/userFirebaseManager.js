const axios = require("axios");
const serviceAccount = require("./firebase_admin_sdk.json");
const fireBaseAdmin = require('firebase-admin');

module.exports = class {
  #axios;
  #axiosSecureToken;

  constructor() {
    this.#axios = axios.create({
      baseURL: "https://identitytoolkit.googleapis.com/v1/"
    });
    this.#axiosSecureToken = axios.create({
      baseURL: "https://securetoken.googleapis.com/v1/"
    });
    if (serviceAccount) {
      fireBaseAdmin.initializeApp({
        credential: fireBaseAdmin.credential.cert(serviceAccount),
        databaseURL: process.env.MCAM_FIREBASE_DB_URL
      });
    } else {
      console.warn("No firebase admin config!");
    }
  }

  async singUpInFirebaseAsync(userSingUpData) {
    const response = await this.#axios
      .post(`accounts:signUp?key=${process.env.FIREBASE_API_KEY}`, {
        email: userSingUpData.email,
        password: userSingUpData.password,
        returnSecureToken: true
      });
    if (response && response.status === 200) {
      this.sendEmailVerificationAsync(response.data.idToken);
    }
    return response;
  }

  async logInFirebaseAsync(userSingUpData) {
    return await this.#axios
      .post(`accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
        email: userSingUpData.email,
        password: userSingUpData.password,
        returnSecureToken: true
      });
  }

  async setupDisplayNameAsync(userSingUpData, displayName) {
    return await this.#axios
      .post(`accounts:update?key=${process.env.FIREBASE_API_KEY}`, {
        idToken: userSingUpData.idToken,
        displayName,
        returnSecureToken: false
      });
  }

  async refreshIdTokenAsync(refreshToken) {
    return await this.#axiosSecureToken
      .post(`token?key=${process.env.FIREBASE_API_KEY}`, {
        grant_type: "refresh_token",
        refresh_token: refreshToken
      });
  }

  async verifyIdTokenAsync(idToken) {
    try {
      return await fireBaseAdmin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error(err);
    }
  }

  async getUserDataAsync(idToken) {
    return this.#axios
      .post(`accounts:lookup?key=${process.env.FIREBASE_API_KEY}`, {
        idToken
      });
  }

  async sendEmailVerificationAsync(idToken) {
    return this.#axios
      .post(`accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`, {
        requestType: "VERIFY_EMAIL",
        idToken
      })
      .catch(err => {
        return err.response.data.error;
      });
  }
};