<template>
  <div>
    <div class="col-sm pl-sm-1">
      <h4 class="row">
        {{ `Visible ${issues.length} issues of ${totalIssues} total:` }}
      </h4>
      <form class="row">
        <div class="col-sm">
          <div class="row form-group" v-if="userName">
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
    <section class="row pr-sm-5">
      <table class="table table-bordered table-striped table-sm">
        <thead class="text-sm-center">
          <tr>
            <th v-if="userName">Read:</th>
            <th>Issue name:</th>
            <th>Publication date:</th>
            <th>Volume:</th>
            <th>Issue no:</th>
            <th>Stories:</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(issue, idx) in issues" :key="idx">
            <template v-if="issue.status !== 'ignore'">
              <td v-if="userName">
                <IconLoading v-if="issue.status === 'wait'" />
                <div v-else class="btn-group">
                  <button
                    v-if="
                      issue.status === 'read' || issue.status === 'character'
                    "
                    @click="changeStatus(idx, issue._id, 'clear')"
                    class="btn btn-danger"
                  >
                    Unread
                  </button>
                  <template v-else>
                    <button
                      @click="changeStatus(idx, issue._id, 'read')"
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
                          @click="changeStatus(idx, issue._id, 'ignore')"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
              <td>
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
  </div>
</template>
<script>
import IconLoading from "@/components/icon/IconLoading";
import IssuePreview from "@/components/issue/IssuePreview";
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      readStatuses: ["All", "Read", "Not read"],
      selectedReadStatus: "Not read",
      totalIssues: 0,
      visibleIssues: 0,
      issueName: "",
      issueVolume: "",
      issuesData: undefined
    };
  },
  computed: {
    ...mapGetters("user", ["userName", "idToken"]),
    issues() {
      if (!this.issuesData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      return this.issuesData.filter(issue => {
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
        return true;
      });
    }
  },
  methods: {
    changeStatus(idx, issueId, status) {
      if (this.idToken) {
        const issues = this.issues;
        const previousStatus = issues[idx].status;
        issues[idx].status = "wait";
        axios
          .post("changeIssueStatus", {
            issueId: issueId,
            status: status,
            idToken: this.idToken,
            characterId: this.characterId
          })
          .then(response => {
            if (response.data.status === "ignore") {
              this.totalIssues -= 1;
            }
            this.issues[idx].status = response.data.status;
          })
          .catch(error => {
            console.error(error);
            issues[idx].status = previousStatus;
          });
      } else {
        this.$fire({
          text: "You are not authorized to do such action",
          type: "error"
        });
      }
    },
    loadIssuePage() {
      this.issueName = this.$route.query.issueName;
      this.issueVolume = this.$route.query.issueVolume;
      axios
        .get("getAllVolumeOfIssues", {
          params: {
            issueName: this.issueName,
            issueVolume: this.issueVolume,
            idToken:
              localStorage.getItem("mcam.idToken") ||
              localStorage.getItem("mcam.firebase.idToken")
          }
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
        { issueId },
        { height: "auto", scrollable: true, width: 1000 }
      );
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
  created() {
    this.loadIssuePage();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  },
  components: {
    IconLoading
  }
};
</script>
