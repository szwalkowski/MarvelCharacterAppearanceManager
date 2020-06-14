<template>
  <tr>
    <template>
      <td v-if="user">
        <IconLoading v-if="issue.status === 'wait'" />
        <div v-else class="btn-group">
          <input
            v-model="isSelectedData"
            type="checkbox"
            class="form-check-inline mt-sm-2 ml-sm-1"
            @click="changeMarkOnMe(issueIdx, !isSelectedData)"
          />
          <button
            v-if="issue.status === 'read' || issue.status === 'character'"
            class="btn btn-danger"
            @click="changeStatus('clear')"
          >
            Unread
          </button>
          <template v-else>
            <button class="btn btn-primary" @click="changeStatus('read')">
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
                  @click="changeFavouriteState(!issue.isFavourite)"
                >
                  {{ issue.isFavourite ? "Unfavourite" : "Favourite" }}
                </button>
                <button class="dropdown-item" @click="addIssueToIgnored()">
                  Ignore
                </button>
              </div>
            </div>
          </template>
        </div>
      </td>
      <td>
        <img
          v-if="!!issue.isFavourite"
          src="/img/FavIcon.png"
          style="width: 15px"
        />
        <a type="button" class="text-info" @click="showIssueDetails(issue.id)">
          {{ issue.name }}
        </a>
      </td>
      <td>{{ issue.publishDateTimestamp | timestampToDate }}</td>
      <td>{{ issue.volume }}</td>
      <td>{{ issue.issueNo }}</td>
      <td>
        <table class="table">
          <tbody>
            <tr
              v-for="(appearance, idx) in issue.subtitles"
              :key="idx"
              style="background-color: inherit"
            >
              <td>{{ appearance }}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </template>
  </tr>
</template>
<script>
import IssuePreview from "@/components/issue/IssuePreview";
import IconLoading from "@/components/icon/IconLoading";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    IconLoading
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
  props: {
    issue: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    issueIdx: {
      type: Number,
      required: true
    },
    changeMarkOnMe: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isSelectedData: false
    };
  },
  computed: {
    ...mapGetters("user", ["user"])
  },
  watch: {
    isSelected(newValue) {
      this.isSelectedData = newValue;
    }
  },
  methods: {
    ...mapActions("issue", [
      "changeStatusOfIssues",
      "changeFavouriteStateOfIssue",
      "changeIgnoreStateOfIssue"
    ]),
    showIssueDetails() {
      this.$modal.show(
        IssuePreview,
        { issueId: this.issue.id, markIssueAsFn: this.markIssueAs },
        { height: "auto", scrollable: true, width: 1000 }
      );
    },
    markIssueAs({ status, state, characterId }) {
      if (status === "favourite") {
        this.issue.isFavourite = state;
      } else if (status === "ignore") {
        this.totalIssues += state ? -1 : 1;
        this.issue.isIgnored = state;
      } else if (
        (status === "character" && characterId === this.characterId) ||
        status !== "character"
      ) {
        this.issue.status = status;
      }
    },
    changeStatus(status) {
      const previousStatus = this.issue.status;
      this.issue.status = "wait";
      this.changeStatusOfIssues({
        issuesIds: [this.issue.id],
        status
      })
        .then(response => {
          this.issue.status = response.data[this.issue.id].status;
        })
        .catch(error => {
          this.issue.status = previousStatus;
          console.error(error);
          this.$fire({
            text: "You are not authorized to do such action",
            type: "error"
          });
        });
    },
    addIssueToIgnored() {
      this.changeIgnoreStateOfIssue({ issueId: this.issue.id, state: true })
        .then(() => {
          this.issue.isIgnored = true;
        })
        .catch(err => {
          console.error(err);
        });
    },
    changeFavouriteState(state) {
      this.changeFavouriteStateOfIssue({ issueId: this.issue.id, state })
        .then(() => {
          this.issue.isFavourite = state;
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>
