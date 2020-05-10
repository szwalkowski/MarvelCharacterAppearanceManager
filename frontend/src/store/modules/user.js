import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";

const state = {
  user: null,
  isUserLoadInProgress: true,
  userMcamSession: {}
};

const getters = {
  user: state => {
    return state.user;
  },
  isUserLoadInProgress: state => {
    return state.isUserLoadInProgress;
  },
  userMcamSession: state => {
    return state.userMcamSession;
  }
};

const mutations = {
  assignUser(user) {
    state.user = user;
  },
  assignUserMcamSession(userMcamSession) {
    state.userMcamSession = userMcamSession;
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
      .then(response => {
        mutations.assignUserMcamSession(response.data);
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
