import Vue from "vue";
import VueSimpleAlert from "vue-simple-alert";
import App from "./App.vue";
import Vuelidate from "vuelidate";
import router from "./router";
import axios from "axios";
import store from "./store/store";
import VModal from "vue-js-modal";
import firebase from "firebase/app";

Vue.config.productionTip = false;

axios.defaults.baseURL = "http://localhost:3000";
axios.interceptors.request.use(async config => {
  if (config.mcamAuthenticated) {
    try {
      const idToken = await store.dispatch("user/getIdToken");
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch (e) {}
  }
  return config;
});

firebase.initializeApp({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
});
Vue.use(VueSimpleAlert);
Vue.use(Vuelidate);
Vue.use(VModal, { dynamic: true, injectModalsContainer: true });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
