<template>
  <div class="card horizontal col-auto">
    <IconLoading v-if="isLoading" />
    <div v-else>
      <div v-for="(issue, idx) in issues" :key="issue" class="row">
        <button
          @click="removeIssueFromList(idx, issue)"
          class="btn btn-primary btn-sm m-sm-1"
        >
          X
        </button>
        <p class="pl-sm-3 mt-sm-1">{{ issue | removeDash }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import IconLoading from "@/components/icon/IconLoading";
import { mapGetters, mapMutations, mapActions } from "vuex";
import axios from "axios";

export default {
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
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    ...mapActions("issue", [
      "changeIgnoreStateOfIssue",
      "changeFavouriteStateOfIssue"
    ]),
    loadPageData(issueTypeView) {
      this.enableLoading();
      axios
        .get(`issues/${issueTypeView}`, { mcamAuthenticated: true })
        .then(response => {
          if (response.data) {
            this.issues = response.data.sort();
          }
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          this.disableLoading();
        });
    },
    removeIssueFromList(idx, issueId) {
      let methodToCall;
      if (this.issueTypeView === "ignored") {
        methodToCall = this.changeIgnoreStateOfIssue;
      } else if (this.issueTypeView === "favourites") {
        methodToCall = this.changeFavouriteStateOfIssue;
      } else {
        console.error("Something went wrong with issue type view");
      }
      methodToCall({ issueId, state: false })
        .then(() => {
          this.issues.splice(idx, 1);
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  created() {
    this.loadPageData(this.issueTypeView);
  },
  filters: {
    removeDash(title) {
      return title.replace("_", " ");
    }
  },
  components: {
    IconLoading
  }
};
</script>
