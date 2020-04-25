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
          <div class="col">
            <button
              @click="showImage(issue._id, issue.image)"
              class="btn btn-sm btn-info"
            >
              Image
            </button>
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
          <div v-if="user && !issue.read">
            <button
              v-if="character.read"
              @click="changeStatus('clear', character.characterId)"
              class="btn btn-danger btn-sm"
            >
              Unread
            </button>
            <button
              v-else
              @click="changeStatus('character', character.characterId)"
              class="btn btn-primary btn-sm"
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
        @click="changeStatus('clear')"
        class="btn btn-sm btn-dark"
      >
        Unread issue
      </button>
      <button v-else class="btn btn-sm btn-dark" @click="changeStatus('read')">
        Read issue
      </button>
    </div>
  </div>
</template>
<script>
import IssueImage from "@/components/issue/IssueImage";
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      issue: {},
      stories: {}
    };
  },
  props: ["issueId"],
  computed: {
    ...mapGetters("user", ["user"])
  },
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
      axios
        .post("changeIssueStatus", {
          issueId: this.issue._id,
          status: status,
          idToken: this.idToken,
          characterId
        })
        .then(response => {
          if (response.data.status === "read") {
            this.issue.read = true;
          } else if (response.data.status === "clear") {
            this.issue.read = false;
          }
          for (const story in this.stories) {
            this.stories[story].characters.forEach(character => {
              character.read =
                response.data.characters.indexOf(character.characterId) >= 0;
            });
          }
          this.updateStories();
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
