const state = {
  isLoading: false
};

const getters = {
  isLoading: state => {
    return state.isLoading;
  }
};

const mutations = {
  enableLoading(state) {
    state.isLoading = true;
  },
  disableLoading(state) {
    state.isLoading = false;
  }
};

export default {
  namespaced: true,
  mutations,
  getters,
  state
};
