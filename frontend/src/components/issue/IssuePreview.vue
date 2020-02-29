<template>
  <div>
    <div v-if="issue.read" class="bg-primary modal-header align-content-center">
      <h4>You've read it fully. Awesome!</h4>
    </div>
    <div class="p-sm-5 modal-body">
      <div class="row pl-sm-4 modal-title">
        <h3>
          <a :href="issue.url" target="_blank">{{ issue.name }}</a>
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
        </div>
      </div>
      <div
        class="pl-sm-4 pt-sm-3 modal-content"
        v-for="(characters, title) in stories"
        :key="title"
      >
        <h5 class="row pb-sm-2">{{ title }}</h5>
        <div
          class="row col-sm-auto"
          v-for="character in characters.characters"
          :key="character.characterId"
        >
          <div v-if="character.read" class="pt-sm-1">
            <p class="text-info">READ</p>
          </div>
          <h4 class="col-sm-6">
            <a href="#" @click="navigateToCharacter(character.characterId)">
              {{ character.characterAlias }} ({{ character.characterUniverse }})
            </a>
          </h4>
          <p class="col-sm-auto">{{ character.characterFocusType }}</p>
          <p class="col-sm-auto">{{ character.characterAppearanceTypes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      issue: {},
      stories: {}
    };
  },
  props: ["issueId"],
  methods: {
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
            characterAlias: appearance.characterAlias,
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
      const newRoute = `/issues?characterId=${characterId}`;
      if (decodeURIComponent(this.$route.fullPath) !== newRoute) {
        this.$router.push(newRoute);
      }
      this.$emit("close");
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
    axios
      .get("issueDetails", {
        params: {
          issueId: this.issueId,
          idToken:
            localStorage.getItem("mcam.idToken") ||
            localStorage.getItem("mcam.firebase.idToken")
        }
      })
      .then(response => {
        this.issue = response.data;
        this.stories = this.updateStories();
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>
