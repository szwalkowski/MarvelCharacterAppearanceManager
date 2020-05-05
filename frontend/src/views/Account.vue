<template>
  <div class="row">
    <div class="card btn-gr col-auto">
      <button
        @click="selectedComponent = 'AccountInfo'"
        class="btn btn-secondary"
      >
        Account info
      </button>
      <button
        @click="showFavourites()"
        class="btn btn-secondary"
      >
        Favourite issues
      </button>
      <button
        @click="showIgnored()"
        class="btn btn-secondary"
      >
        Ignored issues
      </button>
    </div>
    <component class="flex-fill" :is="selectedComponent" :issueTypeView="issueTypeView" />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import IssueSimpleList from "../components/issue/IssueSimpleList";
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
    }
  },
  components: {
    AccountInfo,
    IssueSimpleList
  }
};
</script>
