const state = {
  userData: {
    userName: undefined
  }
};

const getters = {
  userName: state => {
    return state.userData && state.userData.userName;
  }
};

export default {
  namespaced: true,
  state,
  getters
};
