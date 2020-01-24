<template>
  <div class="actions actions_left universe-container">
    <form id="sort-universe-list-form" class="sort-universe-list-form">
      <h4>Universe list:</h4>
      <div
        class="universe-list-options universe-list-options-buttons"
        v-if="selectedCharacter"
      >
        <template v-for="universe in selectedCharacter.universes">
          <button
            type="button"
            :key="universe"
            :class="{
              selectedUniverse:
                selectedUniverse && selectedUniverse === universe
            }"
            @click="selectUniverse(universe)"
          >
            {{ universe }}
          </button>
          <br :key="'_' + universe" />
        </template>
      </div>
    </form>
  </div>
</template>
<script>
import { eventBus } from "../../main";

export default {
  data() {
    return {
      selectedCharacter: undefined,
      selectedUniverse: undefined
    };
  },
  methods: {
    selectUniverse(universe) {
      this.selectedUniverse = universe;
    }
  },
  created() {
    eventBus.$on("barNavCharacterSelected", character => {
      this.selectedCharacter = character;
      this.selectedUniverse = undefined;
    });
    eventBus.$on("resetCharacterSelection", () => {
      this.selectedCharacter = undefined;
      this.selectedUniverse = undefined;
    });
  }
};
</script>
<style>
.selectedUniverse {
  color: #438c0c;
}
</style>
