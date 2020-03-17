<template>
  <div class="bg-secondary flex-fill" v-click-outside="collapse">
    <div class="text-center flex-fill">
      <button class="btn btn-sm btn-secondary" @click.stop="show = !show">
        <img
          :src="`/img/${show ? 'Collapse' : 'Expand'}Icon.png`"
          style="width: 15px"
        />
        {{ (show ? "Collapse" : "Expand") + " character list" }}
        <img
          :src="`/img/${show ? 'Collapse' : 'Expand'}Icon.png`"
          style="width: 15px"
        />
      </button>
    </div>
    <form v-if="show" class="form-group">
      <ol class="row pl-sm-5 pr-sm-5">
        <template v-for="character in characterList">
          <button
            type="button"
            class="btn btn-primary btn-group-sm ml-sm-2 mt-sm-2"
            :key="character.alias"
            :class="{
              active:
                selectedCharacter && selectedCharacter.alias === character.alias
            }"
            @click="selectCharacter(character)"
          >
            {{ character.alias | underscoresToSpaces }}
          </button>
        </template>
      </ol>
    </form>
    <div class="flex-fill" v-if="show">
      <UniversesBarNav />
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { eventBus } from "../../main";
import vClickOutside from "v-click-outside";
import UniversesBarNav from "./UniversesBarNav";

export default {
  data() {
    return {
      show: false,
      characterList: [],
      selectedCharacter: undefined
    };
  },
  methods: {
    selectCharacter(character) {
      this.selectedCharacter = character;
      eventBus.$emit("barNavCharacterSelected", character);
    },
    getAllCharacters() {
      axios
        .get("getAllCharacters")
        .then(res => {
          this.characterList = [];
          res.data.forEach(character => {
            this.characterList.push(character);
          });
        })
        .catch(error => console.log(error));
    },
    collapse() {
      this.show = false;
      this.selectedCharacter = null;
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
      return value.replace("_", " ");
    }
  },
  created() {
    this.getAllCharacters();
    eventBus.$on("resetCharacterSelection", () => {
      this.selectedCharacter = undefined;
    });
    eventBus.$on("reloadCharacters", () => {
      this.getAllCharacters();
    });
  },
  components: {
    UniversesBarNav
  }
};
</script>
<style>
.selectedCharacter {
  color: #438c0c;
}
</style>
