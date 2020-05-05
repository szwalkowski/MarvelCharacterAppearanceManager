import axios from "axios";

const actions = {
  changeIgnoreStateOfIssue(context, data) {
    return axios.put(
      `issues/${data.issueId}/ignore`,
      {
        state: data.state
      },
      { mcamAuthenticated: true }
    );
  },
  changeFavouriteStateOfIssue(context, data) {
    return axios.put(
      `issues/${data.issueId}/favourite`,
      {
        state: data.state
      },
      { mcamAuthenticated: true }
    );
  }
};

export default {
  namespaced: true,
  actions
};
