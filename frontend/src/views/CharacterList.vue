<template>
  <div>
    <PageableList
      :elementsList="characterList"
      paginatedElementComponent="CharacterRowList"
      type="character"
      :filterMethod="filter"
    />
  </div>
</template>
<script>
import PageableList from "../components/listing/PageableList";
import axios from "axios";

export default {
  components: {
    PageableList
  },
  data() {
    return {
      characterList: [],
      characterFilter: ""
    };
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
  },
  methods: {
    filter(characterList, filter) {
      const filterLowerCase = filter.toLowerCase();
      return characterList.filter(character => {
        if (
          character.realName.toLowerCase().includes(filterLowerCase) ||
          character.displayName.toLowerCase().includes(filterLowerCase)
        ) {
          return true;
        } else if (character.aliases.toLowerCase().includes(filterLowerCase)) {
          return true;
        } else {
          return character.universes.some(universe => {
            if (universe.characterId.toLowerCase().includes(filterLowerCase)) {
              return true;
            }
            if (universe.universe.toLowerCase().includes(filterLowerCase)) {
              return true;
            }
          });
        }
      });
    }
  }
};
</script>
