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
            @click="selectedUniverse(universe)"
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
      selectedCharacter: undefined
    };
  },
  methods: {
    selectedUniverse() {}
  },
  created() {
    eventBus.$on("barNavCharacterSelected", character => {
      this.selectedCharacter = character;
    });
  }
};
</script>
