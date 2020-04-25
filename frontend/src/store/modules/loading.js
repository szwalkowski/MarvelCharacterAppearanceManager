const state = {
  isLoading: false
};

const mutations = {
  changeIsLoadingState(state, { isLoadingEnabled }) {
    state.isLoading = isLoadingEnabled;
  }
};

export default {
  namespaced: true,
  mutations,
  state
};
