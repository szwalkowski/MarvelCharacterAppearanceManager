<template>
  <div class="container-fluid">
    <div class="form-group">
      <ul class="pagination float-sm-right">
        <li class="page-item" :class="currentPage === 0 ? 'disabled' : ''">
          <a
            class="page-link"
            href="javascript:void(0)"
            @click="decrementPage()"
          >
            &laquo;
          </a>
        </li>
        <input
          id="manualPageInput"
          v-model="manualPage"
          type="text"
          class="col-form-label-sm col-form-label-sm"
          :placeholder="currentPage + 1"
          @keyup.enter="changePage"
          @input="isNumber"
          @blur="manualPage = ''"
        />
        <label class="mt-sm-1" for="manualPageInput">of {{ pageCount }}</label>
        <li
          class="page-item"
          :class="currentPage === pageCount - 1 ? 'disabled' : ''"
        >
          <a
            class="page-link"
            href="javascript:void(0)"
            @click="incrementPage()"
          >
            &raquo;
          </a>
        </li>
      </ul>
    </div>
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
        <component
          v-for="(issue, idx) in paginatedData"
          :key="idx"
          :is="paginatedElementComponent"
          :issue="issue"
          :issueIdx="idx"
          :characterId="characterId"
          :isSelected="selectedIndexes[idx]"
          :changeMarkOnMe="changeMarkOnMe"
        />
      </tbody>
    </table>
    <div class="btn-group-sm card-footer">
      <button
        v-if="areAllIssuesMarked"
        class="btn btn-dark btn-sm"
        @click="unmarkAllIssues()"
      >
        Unselect all visible issues
      </button>
      <button v-else class="btn btn-dark btn-sm" @click="markAllIssues()">
        Select all visible issues
      </button>
      <button
        class="btn btn-dark btn-sm"
        :class="anyIssueMarked ? '' : 'disabled'"
        @click="changeStateOfSelectedIssues('read')"
      >
        Read selected issues
      </button>
      <button
        v-if="characterId"
        class="btn btn-dark btn-sm"
        :class="anyIssueMarked ? '' : 'disabled'"
        @click="changeStateOfSelectedIssues('character')"
      >
        Read selected issues for this character only
      </button>
      <button
        class="btn btn-dark btn-sm"
        :class="anyIssueMarked ? '' : 'disabled'"
        @click="changeStateOfSelectedIssues('clear')"
      >
        Unread selected issues
      </button>
    </div>
  </div>
</template>
<script>
import IssueRowForCharacter from "@/components/issue/IssueRowForCharacter";
import IssueRow from "@/components/issue/IssueRow";
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
  components: {
    IssueRow,
    IssueRowForCharacter
  },
  props: {
    issues: {
      required: true
    },
    paginatedElementComponent: {
      type: String,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    characterId: {
      type: String
    }
  },
  data() {
    return {
      currentPage: 0,
      manualPage: "",
      selectedIndexes: new Array(this.pageSize).fill(false)
    };
  },
  computed: {
    ...mapGetters("user", ["user"]),
    pageCount() {
      if (!this.issues.length) {
        return 1;
      }
      return Math.ceil(this.issues.length / this.pageSize);
    },
    paginatedData() {
      if (!this.issues.length) {
        return {};
      }
      const startingIssueIdx = this.currentPage * this.pageSize;
      return this.issues.slice(
        startingIssueIdx,
        startingIssueIdx + this.pageSize
      );
    },
    areAllIssuesMarked() {
      return this.selectedIndexes.every(value => value);
    },
    anyIssueMarked() {
      return this.selectedIndexes.some(value => value);
    }
  },
  watch: {
    paginatedData() {
      for (let i = 0; i < this.pageSize; i++) {
        this.$set(this.selectedIndexes, i, false);
      }
    },
    pageCount(newPageCount) {
      if (newPageCount <= this.currentPage) {
        this.currentPage = Math.max(0, newPageCount - 1);
      }
    }
  },
  methods: {
    ...mapActions("issue", ["changeStatusOfIssues"]),
    changeStateOfSelectedIssues(status) {
      const issuesIds = [];
      for (let i = 0; i < this.pageSize; i++) {
        if (this.selectedIndexes[i]) {
          issuesIds.push(this.paginatedData[i].id);
        }
        this.$set(this.selectedIndexes, i, false);
      }
      const issues = this.issues;
      issues
        .filter(issue => issuesIds.includes(issue.id))
        .forEach(issue => (issue.status = "wait"));
      this.changeStatusOfIssues({
        issuesIds,
        status,
        characterId: this.characterId
      })
        .then(response => {
          for (const [key, value] of Object.entries(response.data)) {
            this.issues.find(issue => issue.id === key).status = value.status;
          }
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
    incrementPage() {
      this.currentPage++;
      if (this.currentPage >= this.pageCount) {
        this.currentPage = this.pageCount - 1;
      }
    },
    decrementPage() {
      this.currentPage--;
      if (this.currentPage < 0) {
        this.currentPage = 0;
      }
    },
    changePage() {
      this.currentPage = this.manualPage - 1;
      this.manualPage = "";
    },
    isNumber() {
      this.manualPage = parseInt(this.manualPage);
      if (isNaN(this.manualPage)) {
        this.manualPage = "";
      }
      if (this.manualPage > this.pageCount) {
        this.manualPage = this.pageCount;
      }
      if (this.manualPage <= 0) {
        this.manualPage = 1;
      }
    },
    markAllIssues() {
      for (let i = 0; i < this.pageSize; i++) {
        this.$set(this.selectedIndexes, i, true);
      }
    },
    unmarkAllIssues() {
      for (let i = 0; i < this.pageSize; i++) {
        this.$set(this.selectedIndexes, i, false);
      }
    },
    changeMarkOnMe(idx, newValue) {
      this.$set(this.selectedIndexes, idx, newValue);
    }
  }
};
</script>
<style scoped>
table {
  margin-bottom: 0 !important;
}
</style>
