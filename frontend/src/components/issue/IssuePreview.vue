<template>
  <div>
    <div v-if="issue.read" class="bg-primary modal-header align-content-center">
      <h4>You've read it fully. Awesome!</h4>
    </div>
    <div class="p-sm-5 modal-body">
      <div class="row pl-sm-4 modal-title">
        <h3>
          <img
            v-if="!!issue.isFavourite"
            src="/img/FavIcon.png"
            style="width: 30px"
          />
          <a :href="issue.url | adjustLinkToIssue" target="_blank">
            {{ issue.name }}
          </a>
        </h3>
      </div>
      <div class="col-sm-auto pl-sm-4 pt-sm-3 badge-secondary">
        <div class="row">
          <div class="col">
            <p>{{ issue.publishDateTimestamp | timestampToDate }}</p>
          </div>
          <div class="col">
            <p>Vol {{ issue.volume }}</p>
          </div>
          <div class="col">
            <p>#{{ issue.issueNo }}</p>
          </div>
          <div class="col">
            <button
              class="btn btn-sm btn-info"
              @click="showImage(issue._id, issue.image)"
            >
              Image
            </button>
          </div>
        </div>
      </div>
      <div
        v-for="(characters, title) in stories"
        :key="title"
        class="pl-sm-4 pt-sm-3 modal-content"
      >
        <h5 class="row pb-sm-2">{{ title }}</h5>
        <div
          v-for="character in characters.characters"
          :key="character.characterId"
          class="row col-sm-auto"
        >
          <div v-if="user && !issue.read">
            <button
              v-if="character.read"
              class="btn btn-danger btn-sm"
              @click="changeStatus('clear', character.characterId)"
            >
              Unread
            </button>
            <button
              v-else
              class="btn btn-primary btn-sm"
              @click="changeStatus('character', character.characterId)"
            >
              Read
            </button>
          </div>
          <h4 class="col-sm-6">
            <a href="#" @click="navigateToCharacter(character.characterId)">
              {{ character.characterDisplayName }} ({{
                character.characterUniverse
              }})
            </a>
          </h4>
          <p class="col-sm-auto">{{ character.characterFocusType }}</p>
          <p class="col-sm-auto">{{ character.characterAppearanceTypes }}</p>
        </div>
      </div>
    </div>
    <div v-if="user" class="modal-footer pr-sm-5">
      <button
        v-if="issue.read"
        class="btn btn-sm btn-dark"
        @click="changeStatus('clear')"
      >
        Unread issue
      </button>
      <button v-else class="btn btn-sm btn-dark" @click="changeStatus('read')">
        Read issue
      </button>
      <button
        v-if="!issue.isFavourite"
        class="btn btn-sm btn-dark"
        @click="changeFavouriteState(true)"
      >
        Mark as favourite
      </button>
      <button
        v-else
        class="btn btn-sm btn-dark"
        @click="changeFavouriteState(false)"
      >
        Unfavourite
      </button>
      <button
        v-if="!issue.isIgnored"
        class="btn btn-sm btn-dark"
        @click="changeIgnoreState(true)"
      >
        Mark as ignore
      </button>
      <button
        v-else
        class="btn btn-sm btn-dark"
        @click="changeIgnoreState(false)"
      >
        Unignore
      </button>
    </div>
  </div>
</template>
<script>
import IssueImage from "@/components/issue/IssueImage";
import axios from "axios";
import { mapActions, mapGetters } from "vuex";

export default {
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
    adjustLinkToIssue(linkToIssue) {
      return `https://marvel.fandom.com${linkToIssue}`;
    }
  },
  props: ["issueId", "markIssueAsFn"],
  data() {
    return {
      issue: {},
      stories: {}
    };
  },
  computed: {
    ...mapGetters("user", ["user", "isUserLoadInProgress"])
  },
  watch: {
    isUserLoadInProgress(newValue) {
      if (!newValue) {
        this.loadIssuePage();
      }
    }
  },
  created() {
    this.loadIssuePage();
  },
  methods: {
    ...mapActions("issue", [
      "changeIgnoreStateOfIssue",
      "changeFavouriteStateOfIssue",
      "changeStatusOfIssues"
    ]),
    updateStories() {
      const stories = {};
      this.issue.appearances.forEach(appearance => {
        appearance.characterAppearance.forEach(storyAppearance => {
          let subStory = stories[storyAppearance.subtitle];
          if (!subStory) {
            subStory = {
              characters: []
            };
            stories[storyAppearance.subtitle] = subStory;
          }
          subStory.characters.push({
            characterId: appearance.characterId,
            characterDisplayName: appearance.characterDisplayName,
            characterRealName: appearance.characterRealName,
            characterUniverse: appearance.characterUniverse,
            characterFocusType: storyAppearance.focusType,
            characterAppearanceTypes: storyAppearance.appearanceTypes,
            read: appearance.read
          });
        });
      });
      return stories;
    },
    navigateToCharacter(characterId) {
      const newRoute = `/character?characterId=${characterId}`;
      if (decodeURIComponent(this.$route.fullPath) !== newRoute) {
        this.$router.push(newRoute);
      }
      this.$emit("close");
    },
    changeStatus(status, characterId) {
      const issueId = this.issue._id;
      this.changeStatusOfIssues({
        issuesIds: [issueId],
        status,
        characterId
      })
        .then(response => {
          if (response.data[issueId].status === "read") {
            this.issue.read = true;
          } else if (response.data[issueId].status === "clear") {
            this.issue.read = false;
          }
          for (const story in this.stories) {
            this.stories[story].characters.forEach(character => {
              character.read =
                response.data[issueId].characters.indexOf(
                  character.characterId
                ) >= 0;
            });
          }
          this.updateStories();
          if (this.markIssueAsFn) {
            this.markIssueAsFn({ status, characterId });
          }
        })
        .catch(error => {
          console.error(error);
        });
    },
    showImage(issueId, imageId) {
      axios
        .get(`issueImageUrl`, {
          params: {
            issueId,
            imageId
          }
        })
        .then(response => {
          this.$modal.show(
            IssueImage,
            { imageUrl: response.data.imageUrl },
            { height: 582, width: 410 }
          );
        })
        .catch(error => {
          console.error(error);
        });
    },
    async loadIssuePage() {
      axios
        .get("issueDetails", {
          params: {
            issueId: this.issueId
          },
          mcamAuthenticated: true
        })
        .then(response => {
          this.issue = response.data;
          this.stories = this.updateStories();
        })
        .catch(error => {
          console.error(error);
        });
    },
    changeFavouriteState(state) {
      this.changeFavouriteStateOfIssue({ issueId: this.issue._id, state })
        .then(() => {
          this.issue.isFavourite = state;
          if (this.markIssueAsFn) {
            this.markIssueAsFn({ status: "favourite", state });
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    changeIgnoreState(state) {
      this.changeIgnoreStateOfIssue({ issueId: this.issue._id, state })
        .then(() => {
          this.issue.isIgnored = state;
          if (this.markIssueAsFn) {
            this.markIssueAsFn({ status: "ignore", state });
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>
