<template>
  <div class="row">
    <div class="card btn-gr col-auto">
      <button
        class="btn btn-secondary"
        @click="selectedComponent = 'AccountInfo'"
      >
        Account info
      </button>
      <button class="btn btn-secondary" @click="showReadIssues()">
        Read issues
      </button>
      <button class="btn btn-secondary" @click="showFavourites()">
        Favourite issues
      </button>
      <button class="btn btn-secondary" @click="showIgnored()">
        Ignored issues
      </button>
      <button
        class="btn btn-secondary"
        @click="selectedComponent = 'AccountDeletion'"
      >
        Remove account
      </button>
    </div>
    <component
      :is="selectedComponent"
      :issueTypeView="issueTypeView"
      class="flex-fill"
    />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import IssueSimpleList from "../components/issue/IssueSimpleList";
import AccountDeletion from "../components/account/AccountDeletion";
import AccountInfo from "../components/account/AccountInfo";

export default {
  data() {
    return {
      issueTypeView: "",
      selectedComponent: "AccountInfo"
    };
  },
  computed: {
    ...mapGetters("user", ["user"])
  },
  methods: {
    showFavourites() {
      this.issueTypeView = "favourites";
      this.selectedComponent = "IssueSimpleList";
    },
    showIgnored() {
      this.issueTypeView = "ignored";
      this.selectedComponent = "IssueSimpleList";
    },
    showReadIssues() {
      this.issueTypeView = "read";
      this.selectedComponent = "IssueSimpleList";
    }
  },
  components: {
    AccountDeletion,
    AccountInfo,
    IssueSimpleList
  }
};
</script>
