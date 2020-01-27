<template>
  <div>
    <div class="actions actions_top">
      <form>
        <h4>Filter issues:</h4>
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
          <template v-for="(type, idx) in focusTypes">
            <label :for="type + idx" :key="type">{{ ` ${type} ` }}</label>
            <input
              :id="type + idx"
              :key="idx"
              type="checkbox"
              checked="checked"
            />
          </template>
        </div>
        <div>
          <label class="label-filter-grouper">Appearance types: </label>
          <input type="checkbox" id="hide-type" checked="checked" />
          <label for="hide-type"> Empty </label>&nbsp;
          <template v-for="(type, idx) in appearanceTypes">
            <input
              :id="type + idx"
              :key="idx"
              type="checkbox"
              checked="checked"
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
      focusTypes: [
        "Featured Character",
        "Antagonist",
        "Supporting Character",
        "Other"
      ],
      selectedReadStatus: "All",
      characterData: {},
      appearanceTypes: []
    };
  },
  computed: {
    issues() {
      let issues = this.characterData.issues;
      if (this.selectedReadStatus !== "All") {
        issues = issues.filter(
          issue =>
            (this.selectedReadStatus === "Read" && issue.read) ||
            (this.selectedReadStatus === "Not read" && !issue.read)
        );
      }
      return issues;
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
    }
  },
  filters: {
    timestampToDate(timestamp) {
      let d = new Date(timestamp),
        month = "" + (d.getMonth() + 1),
        year = d.getFullYear();
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
    this.alias = this.$route.query.characterAlias;
    this.universe = this.$route.query.universe;
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
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>
