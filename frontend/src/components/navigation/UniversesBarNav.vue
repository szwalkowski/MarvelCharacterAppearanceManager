<template>
  <div class="flex-fill">
    <form class="form-group pl-sm-5 pr-sm-5">
      <ol class="row" v-if="selectedCharacter">
        <h4 class="pt-sm-3">Universes:</h4>
        <template v-for="universe in selectedCharacter.universes">
          <button
            type="button"
            class="btn btn-primary btn-group-sm ml-sm-2 mt-sm-2"
            :key="universe.universe"
            :class="{
              active: selectedUniverse && selectedUniverse === universe
            }"
            @click="selectUniverse(universe)"
          >
            {{ universe.universe }}
          </button>
          <br :key="'_' + universe.universe" />
        </template>
      </ol>
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
      this.selectedUniverse = universe.universe;
      const newRoute = `/issues?characterId=${universe.characterId}`;
      if (decodeURIComponent(this.$route.fullPath) !== newRoute) {
        this.$router.push(newRoute);
      }
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
