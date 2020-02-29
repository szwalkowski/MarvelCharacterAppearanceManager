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
            <select id="read-dr" class="col-sm-1" v-model="selectedReadStatus">
              <option v-for="status in readStatuses" :key="status">
                {{ status }}
              </option>
            </select>
          </div>
          <div v-else>
            <p style="color: orange">Please log in to mark issues as read</p>
          </div>
          <div class="row form-group">
            <label class="col-sm-1 pl-sm-0">Focus types:</label>
            <div class="custom-control custom-checkbox col-sm-1">
              <input
                type="checkbox"
                class="custom-control-input"
                id="hide-focus-type"
                v-model="showEmptyFocusTypes"
              />
              <label class="custom-control-label" for="hide-focus-type">
                Empty
              </label>
            </div>
            <div
              class="custom-control custom-checkbox col-sm-1"
              v-for="(type, idx) in focusTypes"
              :key="'_' + type + idx"
            >
              <input
                :id="type + idx"
                :key="idx"
                :value="type"
                class="custom-control-input"
                v-model="selectedFocusTypes"
                type="checkbox"
              />
              <label class="custom-control-label" :for="type + idx" :key="type">
                {{ ` ${type} ` }}
              </label>
            </div>
          </div>
          <div class="row form-group">
            <label class="col-sm-1 pl-sm-0">Appearances: </label>
            <div class="custom-control custom-checkbox col-sm-1">
              <input
                type="checkbox"
                class="custom-control-input"
                id="hide-type"
                v-model="showEmptyAppearanceTypes"
              />
              <label class="custom-control-label" for="hide-type">Empty</label>
            </div>
            <div
              class="custom-control custom-checkbox col-sm-1"
              v-for="(type, idx) in appearanceTypes"
              :key="' ' + idx"
            >
              <input
                type="checkbox"
                class="custom-control-input"
                :id="type + idx"
                :key="idx"
                :value="type"
                v-model="selectedAppearances"
              />
              <label class="custom-control-label" :for="type + idx" :key="type">
                {{ ` ${type} ` }}
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
    <section class="row pr-sm-5">
      <table class="table table-bordered table-striped table-sm">
        <thead>
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
            <td v-if="userName">
              <IconLoading v-if="issue.status === 'wait'" />
              <div v-else class="btn-group">
                <button
                  v-if="issue.status === 'read' || issue.status === 'character'"
                  @click="changeStatus(idx, issue.id, 'clear')"
                  class="btn btn-danger"
                >
                  Unread
                </button>
                <template v-else>
                  <button
                    @click="changeStatus(idx, issue.id, 'read')"
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
                        @click="changeStatus(idx, issue.id, 'character')"
                      >
                        Mark read for this character
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
                @click="showIssueDetails(issue.id)"
              >
                {{ issue.name }}
              </a>
            </td>
            <td>{{ issue.publishDateTimestamp | timestampToDate }}</td>
            <td>{{ issue.volume }}</td>
            <td>{{ issue.issueNo }}</td>
            <td>
              <table class="table">
                <thead>
                  <tr style="background-color: inherit">
                    <th>title</th>
                    <th>focus type</th>
                    <th>appearance type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style="background-color: inherit"
                    v-for="(appearance, idx) in issue.appearances"
                    :key="idx"
                  >
                    <td>{{ appearance.subtitle }}</td>
                    <td>{{ appearance.focusType }}</td>
                    <td>{{ appearance.appearanceTypes }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
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
      characterId: "",
      alias: "",
      universe: "",
      readStatuses: ["All", "Read", "Not read"],
      focusTypes: [],
      selectedFocusTypes: [],
      selectedReadStatus: "Not read",
      characterData: undefined,
      appearanceTypes: [],
      selectedAppearances: [],
      totalIssues: 0,
      visibleIssues: 0,
      showEmptyAppearanceTypes: true,
      showEmptyFocusTypes: true
    };
  },
  computed: {
    ...mapGetters("user", ["userName", "idToken"]),
    issues() {
      if (!this.characterData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      const selectedFocusTypes = this.selectedFocusTypes;
      const selectedAppearances = this.selectedAppearances;
      return this.characterData.issues.filter(issue => {
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
        if (
          (selectedFocusTypes.length !== this.focusTypes.length &&
            issue.appearances.length &&
            !issue.appearances.some(
              app =>
                !app.focusType || selectedFocusTypes.includes(app.focusType)
            )) ||
          (!this.showEmptyFocusTypes &&
            (!issue.appearances ||
              !issue.appearances.some(app => app.focusType)))
        ) {
          return false;
        }
        if (
          issue.appearances.some(appearance => {
            return (
              appearance.appearanceTypes.some(
                type => selectedAppearances.indexOf(type) > -1
              ) ||
              (this.showEmptyAppearanceTypes &&
                appearance.appearanceTypes.length === 0)
            );
          }) ||
          (this.showEmptyAppearanceTypes && !issue.appearances.length)
        ) {
          return true;
        }
        return false;
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
            issues[idx].status = response.data.status;
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
      this.characterId = this.$route.query.characterId;
      this.selectedFocusTypes = this.focusTypes;
      this.showEmptyAppearanceTypes = true;
      this.showEmptyFocusTypes = true;
      axios
        .get("getAllIssuesForCharacter", {
          params: {
            characterId: this.characterId,
            idToken:
              localStorage.getItem("mcam.idToken") ||
              localStorage.getItem("mcam.firebase.idToken")
          }
        })
        .then(response => {
          this.characterData = response.data.characterData;
          this.appearanceTypes = response.data.setOfAppearanceTypes;
          this.selectedAppearances = response.data.setOfAppearanceTypes;
          this.focusTypes = response.data.setOfFocusTypes;
          this.selectedFocusTypes = response.data.setOfFocusTypes;
          this.totalIssues = response.data.characterData.issues.length;
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
