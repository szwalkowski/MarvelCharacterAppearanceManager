<template>
  <div>
    <div class="actions actions_top">
      <form>
        <h4>Filter issues :</h4>
        <h4>{{ `Showing ${issues.length} of ${totalIssues}` }}</h4>
        <br />
        <div>
          <label for="read-status-dropdown" class="label-filter-grouper">
            Read:
          </label>
          <select id="read-status-dropdown" v-model="selectedReadStatus">
            <option v-for="status in readStatuses" :key="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div>
          <label class="label-filter-grouper">Show for focus type:</label>
          <input
            type="checkbox"
            id="hide-focus-type"
            v-model="showEmptyFocusTypes"
          />
          <label for="hide-focus-type"> Empty </label>&nbsp;
          <template v-for="(type, idx) in focusTypes">
            <input
              :id="type + idx"
              :key="idx"
              :value="type"
              v-model="selectedFocusTypes"
              type="checkbox"
            />
            <label :for="type + idx" :key="type">{{ ` ${type} ` }}</label>
          </template>
        </div>
        <div>
          <label class="label-filter-grouper">Appearance types: </label>
          <input
            type="checkbox"
            id="hide-type"
            v-model="showEmptyAppearanceTypes"
          />
          <label for="hide-type"> Empty </label>&nbsp;
          <template v-for="(type, idx) in appearanceTypes">
            <input
              :id="type + idx"
              :key="idx"
              :value="type"
              v-model="selectedAppearances"
              type="checkbox"
            />
            <label :for="type + idx" :key="type">{{ ` ${type} ` }}</label>
          </template>
        </div>
      </form>
    </div>
    <section flex flex-full-center>
      <table>
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
              <table class="small-table">
                <thead>
                  <tr>
                    <th>title</th>
                    <th>focus type</th>
                    <th>appearance type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(appearance, idx) in issue.appearances" :key="idx">
                    <td>{{ appearance.subtitle }}</td>
                    <td>{{ appearance.focusType }}</td>
                    <td>{{ appearance.appearanceTypes }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <template v-if="issue.read">
                <label>{{ issue.read | timestampToTime }}</label>
                <button @click="markAsNotRead(idx, issue.id)">x</button>
              </template>
              <button v-else @click="markAsRead(idx, issue.id)">
                Read!
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <div class="character-manager actions actions_top">
      <div class="nav">
        <label for="alias-text-input">Alias: </label>
        <input type="text" id="alias-text-input" :value="alias" />
        <button type="button">Rename visible alias</button>
        <button type="button">Update character</button>
        <button type="button">Remove character</button>
      </div>
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
