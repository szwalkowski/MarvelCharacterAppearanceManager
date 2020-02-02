<template>
  <div class="actions_left">
    <form class="form-group pr-3">
      <ol class="row-cols-1">
        <h4>Characters:</h4>
      </ol>
      <ol class="row-cols-1">
        <template v-for="character in characterList">
          <button
            type="button"
            class="btn btn-primary btn-block"
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
  </div>
</template>
<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  data() {
    return {
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
    }
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
  }
};
</script>
<style>
.selectedCharacter {
  color: #438c0c;
}
</style>
