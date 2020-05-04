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
        @click="selectedComponent = 'AccountIgnoredIssues'"
        class="btn btn-secondary"
      >
        Ignored issues
      </button>
    </div>
    <component class="flex-fill" :is="selectedComponent" />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import AccountIgnoredIssues from "../components/account/AccountIgnoredIssues";
import AccountInfo from "../components/account/AccountInfo";

export default {
  data() {
    return {
      selectedComponent: "AccountInfo"
    };
  },
  computed: {
    ...mapGetters("user", ["user"])
  },
  components: {
    AccountInfo,
    AccountIgnoredIssues
  }
};
</script>
