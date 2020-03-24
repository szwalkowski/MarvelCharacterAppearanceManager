<template>
  <div>
    <div class="row bg-dark p-sm-3">
      <div class="text-center flex-fill">
        <label class="pr-sm-2" for="character-filter">Search: </label>
        <input
          id="character-filter"
          placeholder="Enter character name"
          type="text"
          v-model="characterFilter"
        />
      </div>
    </div>
    <div
      class="text-center row bg-secondary p-sm-2 h-100"
      style="border: 1px dotted #82cc6f;"
      v-for="character in visibleCharacters"
      :key="character.displayName"
    >
      <div class="col-sm my-auto font-weight-bold text-info">
        {{ character.displayName }}
      </div>
      <div class="col-sm my-auto text-center font-italic font-weight-bold">
        <div
          class="p-sm-1"
          v-for="universe in character.universes"
          :key="universe.universe"
        >
          <a :href="`/issues?characterId=${universe.characterId}`">
            {{ universe.universe }}
          </a>
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
      characterList: [],
      characterFilter: ""
    };
  },
  computed: {
    visibleCharacters() {
      if (!this.characterFilter) {
        return this.characterList;
      }
      const filteredCharacters = [];
      this.characterList.forEach(character => {
        if (
          character.realName
            .toLowerCase()
            .includes(this.characterFilter.toLowerCase()) ||
          character.displayName
            .toLowerCase()
            .includes(this.characterFilter.toLowerCase())
        ) {
          filteredCharacters.push(character);
        } else if (
          character.aliases
            .toLowerCase()
            .includes(this.characterFilter.toLowerCase())
        ) {
          filteredCharacters.push(character);
        } else {
          character.universes.some(universe => {
            if (
              universe.universe
                .toLowerCase()
                .includes(this.characterFilter.toLowerCase())
            ) {
              filteredCharacters.push(character);
              return true;
            }
          });
        }
      });
      return filteredCharacters;
    }
  },
  created() {
    axios
      .get("getAllCharacters")
      .then(res => {
        this.characterList = [];
        res.data.sort((character1, character2) => {
          if (character1.displayName < character2.displayName) {
            return -1;
          }
          return 1;
        });
        res.data.forEach(character => {
          character.universes.sort((universe1, universe2) => {
            if (universe1.universe < universe2.universe) {
              return -1;
            }
            return 1;
          });
          this.characterList.push(character);
        });
      })
      .catch(error => console.log(error));
  }
};
</script>
