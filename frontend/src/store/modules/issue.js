import axios from "axios";

const actions = {
  changeIgnoreStateOfIssue(context, data) {
    if (data.state) {
      return axios.post(
        `issues/ignored/${data.issueId}`,
        {},
        { mcamAuthenticated: true }
      );
    } else {
      return axios.delete(`issues/ignored/${data.issueId}`, {
        mcamAuthenticated: true
      });
    }
  },
  changeFavouriteStateOfIssue(context, data) {
    if (data.state) {
      return axios.post(
        `issues/favourites/${data.issueId}`,
        {},
        { mcamAuthenticated: true }
      );
    } else {
      return axios.delete(`issues/favourites/${data.issueId}`, {
        mcamAuthenticated: true
      });
    }
  }
};

export default {
  namespaced: true,
  actions
};
