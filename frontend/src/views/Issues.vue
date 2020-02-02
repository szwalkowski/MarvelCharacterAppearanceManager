<template>
  <div>
    <div class="col-sm pl-sm-1">
      <h4 class="row">
        {{ `Visible ${issues.length} issues of ${totalIssues} total:` }}
      </h4>
      <form class="row">
        <div class="col-sm">
          <div class="row form-group">
            <label for="read-dr" class="col-sm-1 pl-sm-0">
              Read:
            </label>
            <select id="read-dr" class="col-sm-1" v-model="selectedReadStatus">
              <option v-for="status in readStatuses" :key="status">
                {{ status }}
              </option>
            </select>
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
            <th>Issue name:</th>
            <th>Publication date:</th>
            <th>Volume:</th>
            <th>Issue no:</th>
            <th>Stories:</th>
            <th>Read:</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(issue, idx) in issues" :key="idx">
            <td>
              <a :href="issue.url">{{ issue.name }}</a>
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
            <td>
              <template v-if="issue.read">
                <button
                  class="btn btn-primary btn-sm"
                  @click="markAsNotRead(idx, issue.id)"
                >
                  x
                </button>
                <label>{{ issue.read | timestampToTime }}</label>
              </template>
              <button
                class="btn btn-primary btn-sm"
                v-else
                @click="markAsRead(idx, issue.id)"
              >
                Read!
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <div class="row">
      <label for="alias-text-input">Alias: </label>
      <input type="text" id="alias-text-input" :value="alias" />
      <button type="button" class="btn btn-primary btn-sm">
        Rename visible alias
      </button>
      <button type="button" class="btn btn-primary btn-sm">
        Update character
      </button>
      <button type="button" class="btn btn-primary btn-sm">
        Remove character
      </button>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      alias: "",
      universe: "",
      readStatuses: ["All", "Read", "Not read"],
      focusTypes: [],
      selectedFocusTypes: [],
      selectedReadStatus: "All",
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
    issues() {
      if (!this.characterData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      const selectedFocusTypes = this.selectedFocusTypes;
      const selectedAppearances = this.selectedAppearances;
      return this.characterData.issues.filter(issue => {
        if (
          (selectedReadStatus === "Read" && !issue.read) ||
          (selectedReadStatus === "Not read" && issue.read)
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
    markAsRead(idx, issueId) {
      axios
        .post("markIssueAsRead", {
          issueId: issueId,
          characterAlias: this.alias,
          characterUniverse: this.universe
        })
        .then(response => {
          this.characterData.issues[idx].read = response.data.readTime;
        })
        .catch(error => {
          console.error(error);
        });
    },
    markAsNotRead(idx, issueId) {
      axios
        .post("unmarkIssueAsRead", {
          issueId: issueId,
          characterAlias: this.alias,
          characterUniverse: this.universe
        })
        .then(() => {
          this.characterData.issues[idx].read = null;
        })
        .catch(error => {
          console.error(error);
        });
    },
    loadIssuePage() {
      this.alias = this.$route.query.characterAlias;
      this.universe = this.$route.query.universe;
      this.selectedFocusTypes = this.focusTypes;
      this.showEmptyAppearanceTypes = true;
      this.showEmptyFocusTypes = true;
      axios
        .get("getAllIssuesForCharacter", {
          params: {
            alias: this.alias,
            universe: this.universe
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
    },
    timestampToTime(timestamp) {
      const date = new Date(timestamp);
      const yyyy = date.getFullYear();
      let mm = date.getMonth() + 1;
      if (mm < 10) {
        mm = "0" + mm;
      }
      let dd = date.getDate();
      if (dd < 10) {
        dd = "0" + dd;
      }
      let hours = date.getHours();
      if (hours < 10) {
        hours = "0" + hours;
      }
      let minutes = date.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      let seconds = date.getSeconds();
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return (
        yyyy + "-" + mm + "-" + dd + " " + hours + ":" + minutes + ":" + seconds
      );
    }
  },
  created() {
    this.loadIssuePage();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  }
};
</script>
