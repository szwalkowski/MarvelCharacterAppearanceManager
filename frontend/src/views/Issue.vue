<template>
  <div class="container">
    <IconLoading v-if="isLoading" />
    <div v-else class="col-sm">
      <h4 class="row">
        {{ `Filtered ${issues.length} issues of ${totalIssues} total:` }}
      </h4>
      <form class="row">
        <div class="col-sm">
          <div v-if="user" class="row form-group">
            <label for="read-dr" class="col-sm-1 pl-sm-0">
              Status:
            </label>
            <select id="read-dr" v-model="selectedReadStatus" class="col-sm-2">
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
      <IssuePageableTableView
        paginatedElementComponent="IssueRow"
        :issues="issues"
      />
    </section>
  </div>
</template>
<script>
import IconLoading from "../components/icon/IconLoading";
import IssuePageableTableView from "../components/issue/IssuePageableTableView";
import axios from "axios";
import { mapGetters, mapMutations } from "vuex";

export default {
  components: {
    IconLoading,
    IssuePageableTableView
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
  data() {
    return {
      readStatuses: ["Not read", "All", "Read"],
      selectedReadStatus: "Not read",
      totalIssues: 0,
      visibleIssues: 0,
      issueName: "",
      issueVolume: "",
      issuesData: undefined
    };
  },
  computed: {
    ...mapGetters("loading", ["isLoading"]),
    ...mapGetters("user", ["user", "isUserLoadInProgress"]),
    issues() {
      if (!this.issuesData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      return this.issuesData.filter(issue => {
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
        return true;
      });
    }
  },
  watch: {
    isUserLoadInProgress(newValue) {
      if (!newValue) {
        this.loadIssuePage();
      }
    }
  },
  mounted() {
    this.loadIssuePage();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  },
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    async loadIssuePage() {
      this.enableLoading();
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
        })
        .finally(() => {
          this.disableLoading();
        });
    }
  }
};
</script>
