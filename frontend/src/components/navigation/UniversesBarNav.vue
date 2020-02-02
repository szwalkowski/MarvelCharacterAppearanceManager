<template>
  <div class="actions_left">
    <form class="form-group pl-1">
      <ol class="row-cols-1 pl-0">
        <h4>Universes:</h4>
      </ol>
      <ol class="pl-0" v-if="selectedCharacter">
        <template v-for="universe in selectedCharacter.universes">
          <button
            type="button"
            class="btn btn-primary btn-block"
            :key="universe"
            :class="{
              active: selectedUniverse && selectedUniverse === universe
            }"
            @click="selectUniverse(universe)"
          >
            {{ universe }}
          </button>
          <br :key="'_' + universe" />
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
      this.selectedUniverse = universe;
      const newRoute = `/issues?characterAlias=${this.selectedCharacter.alias}&universe=${universe}`;
      if (this.$route.fullPath !== newRoute) {
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
