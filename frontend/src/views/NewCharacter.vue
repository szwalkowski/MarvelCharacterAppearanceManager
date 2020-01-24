<template>
  <div>
    <div class="issue-filter-div actions actions_top">
        <div v-if="errors.length" style="color: red; padding-left: 1rem !important;">
          <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <form @submit="checkForm">
        <label for="url">Url to new character: </label>
        <input
          type="text"
          id="url"
          v-model="newCharacterData.url"
          @click="selectAll($event)"
          name="url"
        />
        <label for="alias">Custom alias: </label>
        <input type="text" id="alias" v-model="newCharacterData.customAlias" />
        <button type="submit">Upload character</button>
        <label id="error-label"></label>
      </form>
    </div>
    <div v-if="characterInfoLoaded" class="issues-container">
      <table>
        <tr>
          <th>Real name</th>
          <th>Alias</th>
          <th>Universe</th>
          <th>Appearances</th>
          <th>Minor appearances</th>
          <th>Image</th>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table>

      <button>Confirm</button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      characterInfoLoaded: false,
      errors: [],
      newCharacterData: {
        url: "https://marvel.fandom.com/wiki/",
        customAlias: ""
      }
    };
  },
  methods: {
    selectAll(event) {
      event.target.select();
    },
    checkForm(event) {
      this.errors = [];
      let url = this.newCharacterData.url;
      if (!url.trim() || url === "https://marvel.fandom.com/wiki/") {
        this.errors.push("Please provide url to character");
      } else if (!url.startsWith("https://marvel.fandom.com/wiki/")) {
        this.errors.push("Please provide url to marvel.fandom.com wiki");
      }
      event.preventDefault();
    }
  }
};
</script>
<style>
#url {
  width: 20rem;
}
</style>
