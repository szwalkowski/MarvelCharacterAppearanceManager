const state = {
  userData: {
    idToken: null,
    userId: null,
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
    state.userData.idToken = userData.idToken;
    state.userData.userId = userData.localId;
    state.userData.userName = userData.email;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations
};
