<template>
  <div class="container">
    <div class="col-sm">
      <h4 class="row">
        {{ `Visible ${issues.length} issues of ${totalIssues} total:` }}
      </h4>
      <form class="row">
        <div class="col-sm">
          <div class="row form-group" v-if="user">
            <label for="read-dr" class="col-sm-1 pl-sm-0">
              Status:
            </label>
            <select id="read-dr" class="col-sm-2" v-model="selectedReadStatus">
              <option v-for="status in readStatuses" :key="status">
                {{ status }}
              </option>
            </select>
          </div>
          <div v-else>
            <p style="color: orange">Please log in to mark issues as read</p>
          </div>
        </div>
      </form>
    </div>
    <section class="row">
      <table class="table table-bordered table-striped table-sm">
        <thead class="text-sm-center">
          <tr>
            <th v-if="user">Read:</th>
            <th>Issue name:</th>
            <th>Publication date:</th>
            <th>Volume:</th>
            <th>Issue no:</th>
            <th>Stories:</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(issue, idx) in issues" :key="idx">
            <template>
              <td v-if="user">
                <IconLoading v-if="issue.status === 'wait'" />
                <div v-else class="btn-group">
                  <input
                    type="checkbox"
                    class="form-check-inline mt-sm-2 ml-sm-1"
                    v-model="issue.selected"
                  />
                  <button
                    v-if="
                      issue.status === 'read' || issue.status === 'character'
                    "
                    @click="changeStatus([issue._id], 'clear')"
                    class="btn btn-danger"
                  >
                    Unread
                  </button>
                  <template v-else>
                    <button
                      @click="changeStatus([issue._id], 'read')"
                      class="btn btn-primary"
                    >
                      Read
                    </button>
                    <div class="btn-group">
                      <button
                        class="btn btn-primary dropdown-toggle"
                        data-toggle="dropdown"
                      />
                      <div class="dropdown-menu">
                        <button
                          class="dropdown-item"
                          @click="
                            changeFavouriteState(
                              idx,
                              issue._id,
                              !issue.isFavourite
                            )
                          "
                        >
                          {{ issue.isFavourite ? "Unfavourite" : "Favourite" }}
                        </button>
                        <button
                          class="dropdown-item"
                          @click="addIssueToIgnored(idx, issue._id)"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
              <td>
                <img
                  v-if="!!issue.isFavourite"
                  src="/img/FavIcon.png"
                  style="width: 15px"
                />
                <a
                  type="button"
                  class="text-info"
                  @click="showIssueDetails(issue._id)"
                >
                  {{ issue.name }}
                </a>
              </td>
              <td>{{ issue.publishDateTimestamp | timestampToDate }}</td>
              <td>{{ issue.volume }}</td>
              <td>{{ issue.issueNo }}</td>
              <td>
                <table class="table">
                  <tbody>
                    <tr
                      style="background-color: inherit"
                      v-for="(appearance, idx) in issue.subtitles"
                      :key="idx"
                    >
                      <td>{{ appearance }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </section>
    <div class="footer">
      <div class="btn-group-sm card-footer">
        <button
          v-if="allVisibleIssuesShouldBeSelected"
          @click="allVisibleIssuesShouldBeSelected = false"
          class="btn btn-dark btn-sm"
        >
          Unselect all visible issues
        </button>
        <button
          v-else
          @click="allVisibleIssuesShouldBeSelected = true"
          class="btn btn-dark btn-sm"
        >
          Select all visible issues
        </button>
        <button
          @click="changeStateOfSelectedIssues('read')"
          class="btn btn-dark btn-sm"
        >
          Read selected issues
        </button>
        <button
          @click="changeStateOfSelectedIssues('clear')"
          class="btn btn-dark btn-sm"
        >
          Unread selected issues
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import IconLoading from "@/components/icon/IconLoading";
import IssuePreview from "@/components/issue/IssuePreview";
import axios from "axios";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      readStatuses: ["All", "Read", "Not read"],
      selectedReadStatus: "Not read",
      totalIssues: 0,
      visibleIssues: 0,
      issueName: "",
      issueVolume: "",
      issuesData: undefined,
      allVisibleIssuesShouldBeSelected: false
    };
  },
  watch: {
    isUserLoadInProgress(newValue) {
      if (!newValue) {
        this.loadIssuePage();
      }
    }
  },
  computed: {
    ...mapGetters("user", ["user", "isUserLoadInProgress"]),
    issues() {
      if (!this.issuesData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      return this.issuesData.filter(issue => {
        issue.selected = false;
        if (issue.isIgnored) {
          return false;
        }
        if (
          (selectedReadStatus === "Read" &&
            (!issue.status || issue.status === "clear")) ||
          (selectedReadStatus === "Not read" &&
            issue.status &&
            issue.status !== "wait" &&
            issue.status !== "clear")
        ) {
          return false;
        }
        issue.selected = this.allVisibleIssuesShouldBeSelected;
        return true;
      });
    }
  },
  methods: {
    ...mapActions("issue", [
      "changeIgnoreStateOfIssue",
      "changeFavouriteStateOfIssue",
      "changeStatusOfIssues"
    ]),
    changeStateOfSelectedIssues(state) {
      const issueIds = this.issues
        .filter(issue => issue.selected)
        .map(issue => issue._id);
      this.changeStatus(issueIds, state);
    },
    changeStatus(issuesIds, status) {
      const issues = this.issues;
      issues
        .filter(issue => issuesIds.includes(issue._id))
        .forEach(issue => (issue.status = "wait"));
      this.changeStatusOfIssues({
        issuesIds,
        status
      })
        .then(response => {
          for (const [key, value] of Object.entries(response.data)) {
            this.issues.find(issue => issue._id === key).status = value.status;
          }
          this.allVisibleIssuesShouldBeSelected = false;
        })
        .catch(error => {
          console.error(error);
          this.$fire({
            text: "You are not authorized to do such action",
            type: "error"
          });
          this.loadIssuePage();
        });
    },
    async loadIssuePage() {
      this.issueName = this.$route.query.issueName;
      this.issueVolume = this.$route.query.issueVolume;
      axios
        .get("getAllVolumeOfIssues", {
          params: {
            issueName: this.issueName,
            issueVolume: this.issueVolume
          },
          mcamAuthenticated: true
        })
        .then(response => {
          this.issuesData = response.data;
          this.totalIssues = response.data.length;
        })
        .catch(error => {
          console.error(error);
        });
    },
    showIssueDetails(issueId) {
      this.$modal.show(
        IssuePreview,
        { issueId, markIssueAsFn: this.markIssueAs },
        { height: "auto", scrollable: true, width: 1000 }
      );
    },
    changeFavouriteState(idx, issueId, state) {
      this.changeFavouriteStateOfIssue({ issueId, state })
        .then(() => {
          this.issues[idx].isFavourite = state;
        })
        .catch(err => {
          console.error(err);
        });
    },
    addIssueToIgnored(idx, issueId) {
      this.changeIgnoreStateOfIssue({ issueId, state: true })
        .then(() => {
          this.totalIssues -= 1;
          this.issues[idx].isIgnored = true;
        })
        .catch(err => {
          console.error(err);
        });
    },
    markIssueAs(issueId, statusName, state) {
      const issue = this.issuesData.find(issue => issue._id === issueId);
      if (statusName === "favourite") {
        issue.isFavourite = state;
      } else if (statusName === "ignore") {
        this.totalIssues += state ? -1 : 1;
        issue.isIgnored = state;
      } else if (statusName !== "character") {
        issue.status = statusName;
      }
    }
  },
  filters: {
    timestampToDate(timestamp) {
      const d = new Date(timestamp);
      const year = d.getFullYear();
      let month = "" + (d.getMonth() + 1);
      if (month.length < 2) {
        month = "0" + month;
      }
      return [year, month].join("-");
    }
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  },
  mounted() {
    this.loadIssuePage();
  },
  components: {
    IconLoading
  }
};
</script>
