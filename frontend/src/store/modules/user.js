import axios from "axios";

const state = {
  userData: {
    idToken: null,
    userName: null
  }
};

const getters = {
  userName: state => {
    return state.userData && state.userData.userName;
  }
};

const mutations = {
  authUser(state, { userData }) {
    localStorage.setItem("mcam.idToken", userData.idToken);
    state.userData.idToken = userData.idToken;
    state.userData.userName = userData.userName;
  },
  clearAuthUser() {
    localStorage.removeItem("mcam.idToken");
    state.userData.idToken = null;
    state.userData.userName = null;
  }
};

const actions = {
  tryAutoLogIn() {
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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
