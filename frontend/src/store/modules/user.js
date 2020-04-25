import axios from "axios";
import firebase from "firebase/app";

const state = {
  user: null,
  isUserLoadInProgress: true
};

const getters = {
  user: state => {
    return state.user;
  },
  isUserLoadInProgress: state => {
    return state.isUserLoadInProgress;
  }
};

const mutations = {
  assignUser(user) {
    state.user = user;
  }
};

const actions = {
  initFirebase() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        mutations.assignUser(user);
        logInUserInBackend(this);
      } else {
        mutations.assignUser(null);
      }
      state.isUserLoadInProgress = false;
    });
  },
  logOut() {
    firebase.auth().signOut();
    logoutUserInBackend(state.user);
  },
  getIdToken() {
    return state.user
      ? state.user.getIdToken(false)
      : Promise.reject("User not logged");
  }
};

function logInUserInBackend(userStore) {
  actions.getIdToken().then(idToken => {
    axios
      .post("logIn", {
        idToken
      })
      .catch(error => {
        console.error(error);
        userStore.dispatch("user/logOut");
      });
  });
}

function logoutUserInBackend() {
  actions.getIdToken().then(idToken => {
    axios.post("logOut", { idToken });
  });
}

export default {
  namespaced: true,
  state,
  getters,
  actions
};
