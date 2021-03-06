<template>
  <div class="container">
    <IconLoading v-if="isLoading" />
    <div v-else class="col-sm">
      <h3 class="row text-info">
        {{ `${characterId}` | removeDash }}
      </h3>
      <div class="flex-fill" v-click-outside="collapse">
        <div class="text-center flex-fill">
          <button
            class="btn btn-sm btn-secondary"
            style="color: #9c9c9c"
            @click.stop="show = !show"
          >
            <img
              :src="`/img/${show ? 'Collapse' : 'Expand'}Icon.png`"
              style="width: 15px"
            />
            {{ (show ? "Collapse" : "Expand") + " filters menu" }}
            <img
              :src="`/img/${show ? 'Collapse' : 'Expand'}Icon.png`"
              style="width: 15px"
            />
          </button>
        </div>
        <div class="row">
          <form v-if="show" class="form-group">
            <h4 class="row text-light">
              {{ `Filtered ${issues.length} issues of ${totalIssues} total` }}
            </h4>
            <form class="row">
              <div class="col-sm">
                <div v-if="user" class="row form-group">
                  <label for="read-dr" class="col-sm-1 pl-sm-0">
                    Status:
                  </label>
                  <select
                    id="read-dr"
                    v-model="selectedReadStatus"
                    class="col-sm-1"
                  >
                    <option v-for="status in readStatuses" :key="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
                <div v-else>
                  <p style="color: orange">
                    Please log in to mark issues as read
                  </p>
                </div>
                <div class="row form-group">
                  <label class="col-sm-1 pl-sm-0">Focus types:</label>
                  <div class="custom-control custom-checkbox col-sm-auto">
                    <input
                      id="hide-focus-type"
                      v-model="showEmptyFocusTypes"
                      type="checkbox"
                      class="custom-control-input"
                    />
                    <label class="custom-control-label" for="hide-focus-type">
                      Empty
                    </label>
                  </div>
                  <div
                    v-for="(type, idx) in focusTypes"
                    :key="'_' + type + idx"
                    class="custom-control custom-checkbox col-sm-auto"
                  >
                    <input
                      :id="type + idx"
                      :key="idx"
                      v-model="selectedFocusTypes"
                      class="custom-control-input"
                      type="checkbox"
                      :value="type"
                    />
                    <label
                      :key="type"
                      class="custom-control-label"
                      :for="type + idx"
                    >
                      {{ ` ${type} ` }}
                    </label>
                  </div>
                </div>
                <div class="row form-group">
                  <label class="col-sm-1 pl-sm-0">Appearances: </label>
                  <div class="custom-control custom-checkbox col-sm-auto">
                    <input
                      id="hide-type"
                      v-model="showEmptyAppearanceTypes"
                      type="checkbox"
                      class="custom-control-input"
                    />
                    <label class="custom-control-label" for="hide-type">
                      Empty
                    </label>
                  </div>
                  <div
                    v-for="(type, idx) in appearanceTypes"
                    :key="' ' + idx"
                    class="custom-control custom-checkbox col-sm-auto"
                  >
                    <input
                      :id="type + idx"
                      :key="idx"
                      v-model="selectedAppearances"
                      type="checkbox"
                      class="custom-control-input"
                      :value="type"
                    />
                    <label
                      :for="type + idx"
                      :key="type"
                      class="custom-control-label"
                    >
                      {{ ` ${type} ` }}
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </form>
        </div>
      </div>
    </div>
    <section class="row">
      <IssuePageableTableView
        paginatedElementComponent="IssueRowForCharacter"
        :issues="issues"
        :characterId="characterId"
      />
    </section>
  </div>
</template>
<script>
import IconLoading from "../components/icon/IconLoading";
import IssuePageableTableView from "@/components/issue/IssuePageableTableView";
import { mapGetters, mapMutations } from "vuex";
import axios from "axios";
import vClickOutside from "v-click-outside";

export default {
  components: {
    IconLoading,
    IssuePageableTableView
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  filters: {
    removeDash(title) {
      return title.replace(/_/g, " ");
    }
  },
  data() {
    return {
      characterId: "",
      readStatuses: ["Not read", "All", "Read"],
      focusTypes: [],
      selectedFocusTypes: [],
      selectedReadStatus: "Not read",
      characterData: undefined,
      appearanceTypes: [],
      selectedAppearances: [],
      totalIssues: 0,
      showEmptyAppearanceTypes: true,
      showEmptyFocusTypes: true,
      show: false
    };
  },
  computed: {
    ...mapGetters("loading", ["isLoading"]),
    ...mapGetters("user", ["user", "isUserLoadInProgress"]),
    issues() {
      if (!this.characterData) {
        return {};
      }
      const selectedReadStatus = this.selectedReadStatus;
      const selectedFocusTypes = this.selectedFocusTypes;
      const selectedAppearances = this.selectedAppearances;
      return this.characterData.issues.filter(issue => {
        if (issue.isIgnored) {
          this.totalIssues--;
          return false;
        }
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
  watch: {
    selectedAppearances(newValue, oldValue) {
      if (oldValue.length && newValue.length !== oldValue.length) {
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
      }
    },
    selectedFocusTypes(newValue, oldValue) {
      if (oldValue.length && newValue.length !== oldValue.length) {
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
  mounted() {
    this.loadIssuePage();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadIssuePage();
  },
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    async loadIssuePage() {
      this.enableLoading();
      this.characterId = this.$route.query.characterId;
      const disabledAppearancesTypes =
        JSON.parse(localStorage.getItem("disabledAppearanceTypes")) ||
        this.provideDefaultDisabledAppearances();
      this.showEmptyAppearanceTypes =
        disabledAppearancesTypes.indexOf("Empty") === -1;
      const disabledFocusTypes =
        JSON.parse(localStorage.getItem("disabledFocusTypes")) || [];
      this.showEmptyFocusTypes = disabledFocusTypes.indexOf("Empty") === -1;
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
          this.selectedAppearances = response.data.setOfAppearanceTypes.filter(
            appearance => {
              return disabledAppearancesTypes.indexOf(appearance) === -1;
            }
          );
          this.focusTypes = response.data.setOfFocusTypes;
          this.selectedFocusTypes = response.data.setOfFocusTypes.filter(
            appearance => {
              return disabledFocusTypes.indexOf(appearance) === -1;
            }
          );
          this.totalIssues = response.data.characterData.issues.length;
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.disableLoading();
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
    },
    collapse() {
      this.show = false;
    },
    expand() {
      this.show = true;
    },
    provideDefaultDisabledAppearances() {
      const defaultDisabled = [
        "Behind the scenes",
        "Minor",
        "Corpse",
        "Drawing",
        "Dream",
        "Illusion",
        "Appears on a computer screen, TV, or hologram only",
        "Photo",
        "Poster",
        "Recap",
        "Statue",
        "Toy",
        "Vision",
        "Voice",
        "Mentioned",
        "Referenced",
        "Named only",
        "Invoked",
        "Carving"
      ];
      localStorage.setItem(
        "disabledAppearanceTypes",
        JSON.stringify(defaultDisabled)
      );
      return defaultDisabled;
    }
  }
};
</script>
