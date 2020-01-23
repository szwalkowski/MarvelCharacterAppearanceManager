<template>
  <div id="character-list-div" class="actions actions_left">
    <form class="sort-character-list-form">
      <h4>Sort:</h4>
      <div class="character-list-options">
        <select id="sort-order-dropdown" name="sortOrder">
          <option value="0">Alphabetical</option>
          <option value="1">Oldest not read</option>
          <option value="2">With most fresh issues</option>
          <option value="3">Custom</option>
          <option value="4">Most read</option>
          <option value="5">Less read</option>
        </select>
        <br />
      </div>
      <h4>Character list:</h4>
      <div class="character-list-options character-list-options-buttons"></div>
      <template v-for="character in characterList">
        <button type="button" :key="character.alias">
          {{ character.alias | underscoresToSpaces }}
        </button>
        <br :key="'_' + character.alias" />
      </template>
    </form>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      characterList: []
    };
  },
  filters: {
    underscoresToSpaces(value) {
      return value.replace("_", " ");
    }
  },
  created() {
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
};
</script>
