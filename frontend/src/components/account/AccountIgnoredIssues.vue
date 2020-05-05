<template>
  <div class="card horizontal col-auto">
    <IconLoading v-if="isLoading" />
    <div v-else>
      <div
        v-for="(ignoredIssue, idx) in ignoredIssues"
        :key="ignoredIssue"
        class="row"
      >
        <button
          @click="removeIgnore(idx, ignoredIssue)"
          class="btn btn-primary btn-sm m-sm-1"
        >
          X
        </button>
        <p class="pl-sm-3 mt-sm-1">{{ ignoredIssue | removeDash }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import IconLoading from "@/components/icon/IconLoading";
import { mapGetters, mapMutations, mapActions } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      ignoredIssues: []
    };
  },
  computed: {
    ...mapGetters("user", ["user"]),
    ...mapGetters("loading", ["isLoading"])
  },
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    ...mapActions("issue", ["changeIgnoreStateOfIssue"]),
    removeIgnore(idx, issueId) {
      this.changeIgnoreStateOfIssue({ issueId, state: false })
        .then(() => {
          this.ignoredIssues.splice(idx, 1);
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  created() {
    this.enableLoading();
    axios
      .get("issues/ignored", { mcamAuthenticated: true })
      .then(response => {
        if (response.data) {
          this.ignoredIssues = response.data.ignored.sort();
        }
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.disableLoading();
      });
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
