import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";
import router from "../../router/index";

const state = {
  userData: {
    idToken: null,
    userName: null,
    isEmailPassword: false
  },
  googleAuthProvider: null
};

const getters = {
  userName: state => {
    return state.userData && state.userData.userName;
  },
  idToken: state => {
    return state.userData && state.userData.idToken;
  },
  isEmailPassword: state => {
    return state.userData && state.userData.isEmailPassword;
  }
};

const mutations = {
  authUser(state, { userData, isEmailPassword }) {
    state.userData.idToken = userData.idToken;
    state.userData.userName = userData.userName;
    state.userData.isEmailPassword = isEmailPassword;
  },
  clearAuthUser() {
    localStorage.removeItem("mcam.idToken");
    localStorage.removeItem("mcam.firebase.idToken");
    state.userData.idToken = null;
    state.userData.userName = null;
  }
};

const actions = {
  initFirebase() {
    this.state.user.googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    this.state.user.googleAuthProvider.addScope("profile");
    firebase.initializeApp({
      apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
      authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN
    });
    if (
      !localStorage.getItem("mcam.idToken") &&
      localStorage.getItem("mcam.firebase.idToken")
    ) {
      tryToLogInUsingFirebase(firebase, this);
    }
  },
  tryAutoLogIn() {
    if (this.state.user.userName) {
      return;
    }
    const idToken = localStorage.getItem("mcam.idToken");
    if (idToken) {
      axios
        .post("autoLogIn", {
          idToken
        })
        .then(response => {
          if (response.data.idToken) {
            this.commit("user/authUser", { userData: response.data });
          } else {
            this.commit("user/clearAuthUser");
          }
        });
    }
  }
};

function tryToLogInUsingFirebase(firebase, userStore) {
  const storedIdToken = localStorage.getItem("mcam.firebase.idToken");
  if (storedIdToken) {
    logInUsingPreviousFirebaseToken(firebase, userStore, storedIdToken);
  } else {
    logInByRedirectResult(firebase, userStore);
  }
}

function logInUsingPreviousFirebaseToken(firebase, userStore, storedIdToken) {
  firebase
    .auth()
    .signInWithCredential(
      userStore.state.user.googleAuthProvider.credential(storedIdToken)
    )
    .then(res => {
      userStore.commit("user/authUser", {
        userData: {
          idToken: res.user.ma,
          userName: res.user.displayName
        }
      });
      goToAccountIfOnAuthPage();
    })
    .catch(() => {
      localStorage.removeItem("mcam.firebase.idToken");
    });
}

function logInByRedirectResult(firebase, userStore) {
  firebase
    .auth()
    .getRedirectResult()
    .then(signResult => {
      if (signResult.user) {
        goToAccountIfOnAuthPage();
        signResult.user.getIdToken().then(idToken => {
          axios
            .post("verifyGoogleTokenId", {
              idToken,
              sessionType: signResult.credential.signInMethod
            })
            .then(response => {
              localStorage.setItem(
                "mcam.firebase.idToken",
                signResult.credential.idToken
              );
              userStore.commit("user/authUser", { userData: response.data });
            })
            .catch(error => {
              console.error(error);
            });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function goToAccountIfOnAuthPage() {
  const currentPath = router.history.current.path;
  if (currentPath === "/log-in" || currentPath === "/sign-up") {
    router.push("/");
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
