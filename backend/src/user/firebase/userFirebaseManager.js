const axios = require("axios");
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
    fireBaseAdmin.initializeApp({
      apiKey: process.env.MCAM_FIREBASE_API_KEY,
      authDomain: process.env.MCAM_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.MCAM_FIREBASE_DB_URL,
      projectId: process.env.MCAM_FIREBASE_PROJECT_ID,
      storageBucket: process.env.MCAM_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.MCAM_FIREBASE_SENDER_ID,
      appId: process.env.MCAM_FIREBASE_APP_ID
    });
  }

  async verifyIdTokenAsync(idToken) {
    try {
      return await fireBaseAdmin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error(err);
    }
  }
};