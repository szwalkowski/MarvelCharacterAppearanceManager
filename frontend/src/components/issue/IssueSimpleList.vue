<template>
  <div class="card horizontal col-auto">
    <IconLoading v-if="isLoading" />
    <div v-else>
      <div v-if="!issues.length">No {{ issueTypeView }} issues found.</div>
      <PageableList
        v-else
        :elementsList="issues"
        paginatedElementComponent="IssueSimpleRow"
        type="issue"
        :filterMethod="filter"
      />
    </div>
  </div>
</template>
<script>
import IconLoading from "../icon/IconLoading";
import PageableList from "../listing/PageableList";
import { mapGetters, mapMutations } from "vuex";
import axios from "axios";

export default {
  components: {
    IconLoading,
    PageableList
  },
  props: ["issueTypeView"],
  data() {
    return {
      issues: []
    };
  },
  computed: {
    ...mapGetters("user", ["user"]),
    ...mapGetters("loading", ["isLoading"])
  },
  watch: {
    issueTypeView(newValue) {
      this.loadPageData(newValue);
    }
  },
  created() {
    this.loadPageData(this.issueTypeView);
  },
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    loadPageData(issueTypeView) {
      this.enableLoading();
      axios
        .get(`issues/${issueTypeView}`, { mcamAuthenticated: true })
        .then(response => {
          if (response.data) {
            this.issues = response.data;
          }
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          this.disableLoading();
        });
    },
    filter(issueList, filter) {
      const filterLowerCase = filter.toLowerCase();
      return issueList.filter(issue => {
        return issue.issueId.toLowerCase().includes(filterLowerCase);
      });
    }
  }
};
</script>
