<template>
  <div>
    <div class="col-sm pl-sm-1">
      <h4 class="row">
        {{ `Visible ${issues.length} issues of ${totalIssues} total:` }}
      </h4>
      <form class="row">
        <div class="col-sm">
          <div class="row form-group" v-if="user">
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
          <tr v-for="(issue, idx) in issues" :key="idx">
            <template v-if="issue.status !== 'ignore'">
              <td v-if="user">
                <IconLoading v-if="issue.status === 'wait'" />
                <div v-else class="btn-group">
                  <button
                    v-if="
                      issue.status === 'read' || issue.status === 'character'
                    "
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
                        <button
                          class="dropdown-item"
                          @click="changeStatus(idx, issue.id, 'ignore')"
                        >
                          Ignore
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
                    <tr
                      style="background-color: inherit"
                      class="text-sm-center"
                    >
                      <th>Subtitle</th>
                      <th>Focus type</th>
                      <th>Appearance type</th>
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
            </template>
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
import { mapGetters, mapActions } from "vuex";

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
  watch: {
    selectedAppearances(newValue, oldValue) {
      if (
        newValue.length - oldValue.length > 1 ||
        newValue.length === oldValue.length
      ) {
        return;
      }
      if (newValue.length > oldValue.length) {
        const appearanceToShow = newValue.filter(
          value => oldValue.indexOf(value) === -1
        );
        this.editStoredSettings(false, false, appearanceToShow[0]);
      } else {
        const appearanceToHide = oldValue.filter(
          value => newValue.indexOf(value) === -1
        );
        this.editStoredSettings(true, false, appearanceToHide[0]);
      }
    },
    selectedFocusTypes(newValue, oldValue) {
      if (
        newValue.length - oldValue.length > 1 ||
        newValue.length === oldValue.length
      ) {
        return;
      }
      if (newValue.length > oldValue.length) {
        const appearanceToShow = newValue.filter(
          value => oldValue.indexOf(value) === -1
        );
        this.editStoredSettings(false, true, appearanceToShow[0]);
      } else {
        const appearanceToHide = oldValue.filter(
          value => newValue.indexOf(value) === -1
        );
        this.editStoredSettings(true, true, appearanceToHide[0]);
      }
    },
    showEmptyAppearanceTypes(newValue) {
      this.editStoredSettings(!newValue, false, "Empty");
    },
    showEmptyFocusTypes(newValue) {
      this.editStoredSettings(!newValue, true, "Empty");
    },
    isUserLoadInProgress(newValue) {
      if (!newValue) {
        this.loadIssuePage();
      }
    }
  },
  computed: {
    ...mapGetters("user", ["user", "isUserLoadInProgress"]),
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
      const issues = this.issues;
      const previousStatus = issues[idx].status;
      issues[idx].status = "wait";
      axios
        .post(
          "changeIssueStatus",
          {
            issueId,
            status,
            characterId: this.characterId
          },
          {
            mcamAuthenticated: true
          }
        )
        .then(response => {
          if (response.data.status === "ignore") {
            this.totalIssues -= 1;
          }
          this.issues[idx].status = response.data.status;
        })
        .catch(error => {
          console.error(error);
          issues[idx].status = previousStatus;
          this.$fire({
            text: "You are not authorized to do such action",
            type: "error"
          });
        });
    },
    async loadIssuePage() {
      this.characterId = this.$route.query.characterId;
      this.selectedFocusTypes = this.focusTypes;
      this.showEmptyAppearanceTypes = true;
      this.showEmptyFocusTypes = true;
      axios
        .get("getAllIssuesForCharacter", {
          params: {
            characterId: this.characterId
          },
          mcamAuthenticated: true
        })
        .then(response => {
          this.characterData = response.data.characterData;
          this.appearanceTypes = response.data.setOfAppearanceTypes;
          const disabledAppearancesTypes =
            JSON.parse(localStorage.getItem("disabledAppearanceTypes")) || [];
          this.showEmptyAppearanceTypes =
            disabledAppearancesTypes.indexOf("Empty") === -1;
          this.selectedAppearances = response.data.setOfAppearanceTypes.filter(
            appearance => {
              return disabledAppearancesTypes.indexOf(appearance) === -1;
            }
          );
          this.focusTypes = response.data.setOfFocusTypes;
          const disabledFocusTypes =
            JSON.parse(localStorage.getItem("disabledFocusTypes")) || [];
          this.showEmptyFocusTypes = disabledFocusTypes.indexOf("Empty") === -1;
          this.selectedFocusTypes = response.data.setOfFocusTypes.filter(
            appearance => {
              return disabledFocusTypes.indexOf(appearance) === -1;
            }
          );
          this.totalIssues = response.data.characterData.issues.length;
        })
        .catch(error => {
          console.error(error);
        });
      this.addOccurrenceToLastVisitedCharacter(this.characterId);
    },
    addOccurrenceToLastVisitedCharacter(characterId) {
      let lastCharacters = JSON.parse(localStorage.getItem("lastCharacters"));
      if (!lastCharacters) {
        lastCharacters = [];
      }
      let characterOccurrence = lastCharacters.find(
        character => character.id === characterId
      );
      if (!characterOccurrence) {
        characterOccurrence = { id: characterId, occurrence: 0 };
        lastCharacters.push(characterOccurrence);
      }
      characterOccurrence.occurrence++;
      characterOccurrence.timestamp = new Date().getTime();
      const maxOccurrences = 30;
      if (lastCharacters.length > maxOccurrences) {
        lastCharacters.sort((lc1, lc2) => {
          if (lc1.timestamp > lc2.timestamp) {
            return -1;
          }
          return 1;
        });
        lastCharacters.splice(
          maxOccurrences,
          lastCharacters.length - maxOccurrences
        );
      }
      lastCharacters.sort((lc1, lc2) => {
        if (lc1.occurrence > lc2.occurrence) {
          return -1;
        }
        if (lc1.occurrence < lc2.occurrence) {
          return 1;
        }
        if (lc1.timestamp > lc2.timestamp) {
          return -1;
        }
        return 1;
      });
      localStorage.setItem("lastCharacters", JSON.stringify(lastCharacters));
    },
    showIssueDetails(issueId) {
      this.$modal.show(
        IssuePreview,
        { issueId },
        { height: "auto", scrollable: true, width: 1000 }
      );
    },
    editStoredSettings(shouldAddToDisable, isFocusType, name) {
      if (isFocusType) {
        this.addToLocalStorage("disabledFocusTypes", shouldAddToDisable, name);
      } else {
        this.addToLocalStorage(
          "disabledAppearanceTypes",
          shouldAddToDisable,
          name
        );
      }
    },
    addToLocalStorage(storageKey, shouldAddToDisable, name) {
      const disabledTypes = JSON.parse(localStorage.getItem(storageKey)) || [];
      const indexOfDisabledType = disabledTypes.indexOf(name);
      if (shouldAddToDisable && indexOfDisabledType === -1) {
        disabledTypes.push(name);
      } else if (!shouldAddToDisable && indexOfDisabledType > -1) {
        disabledTypes.splice(indexOfDisabledType, 1);
      }
      localStorage.setItem(storageKey, JSON.stringify(disabledTypes));
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
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  },
  components: {
    IconLoading
  }
};
</script>
