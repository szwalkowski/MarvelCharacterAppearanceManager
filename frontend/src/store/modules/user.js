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
  }
};

const actions = {
  tryAutoLogIn () {
    const idToken = localStorage.getItem("mcam.idToken");
    axios
      .get("autoLogIn", {
        params: {
          idToken
        }
      })
      .then(res => {
        if (res.data.idToken) {
          state.userData.idToken = res.data.idToken;
          state.userData.userName = res.data.userName;
        }
      });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
