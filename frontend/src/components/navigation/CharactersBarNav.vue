<template>
  <div
    class="bg-secondary flex-fill"
    v-click-outside="collapse"
    v-if="characterList.length"
  >
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
        {{ (show ? "Collapse" : "Expand") + " quick characters menu" }}
        <img
          :src="`/img/${show ? 'Collapse' : 'Expand'}Icon.png`"
          style="width: 15px"
        />
      </button>
    </div>
    <div class="row">
      <form v-if="show" class="form-group">
        <ol class="row pl-sm-5 pr-sm-5">
          <template v-for="character in characterList">
            <button
              type="button"
              class="btn btn-sm btn-primary btn-group-sm ml-sm-2 mt-sm-2"
              :key="character"
              @click="selectCharacter(character)"
            >
              {{ character | underscoresToSpaces }}
            </button>
          </template>
        </ol>
      </form>
    </div>
  </div>
</template>
<script>
import vClickOutside from "v-click-outside";

export default {
  data() {
    return {
      show: false,
      characterList: []
    };
  },
  methods: {
    selectCharacter(character) {
      this.collapse();
      const newRoute = `/character?characterId=${character}`;
      if (decodeURIComponent(this.$route.fullPath) !== newRoute) {
        this.$router.push(newRoute);
      }
    },
    getLastCharacters() {
      const lastCharacters = JSON.parse(localStorage.getItem("lastCharacters"));
      if (lastCharacters) {
        for (let i = 0; i < 11 && i < lastCharacters.length; i++) {
          this.characterList.push(lastCharacters[i].id);
        }
      }
    },
    collapse() {
      this.show = false;
    },
    expand() {
      this.show = true;
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  filters: {
    underscoresToSpaces(value) {
      return value.replace(/_/g, " ");
    }
  },
  created() {
    this.getLastCharacters();
  }
};
</script>
