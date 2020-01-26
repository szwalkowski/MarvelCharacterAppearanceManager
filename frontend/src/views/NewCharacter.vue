<template>
  <div>
    <div class="issue-filter-div actions actions_top">
      <div v-if="errors.length" style="color: red">
        <b>Please correct the following error(s):</b>
        <br />
        <ul style="padding-left: 1rem">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <form @submit.prevent="checkForm" action="newCharacter">
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
    <div v-if="characterInfo" class="issues-container">
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
          <td>{{ characterInfo.RealName }}</td>
          <td>{{ characterInfo.SetAlias }}</td>
          <td>{{ characterInfo.Universe }}</td>
          <td>{{ characterInfo.AppearanceCount }}</td>
          <td>{{ characterInfo.MinorAppearanceCount }}</td>
          <td><a :href="characterInfo.ImageUrl">Image</a></td>
        </tr>
      </table>

      <button @click="confirmCharacter">Confirm</button>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { eventBus } from "../main";

const marvelWikiUrl = "https://marvel.fandom.com/wiki/";
const maxAliasLength = 20;
const aliasRegexp = /[a-zA-Z0-9 ]+/;

export default {
  data() {
    return {
      characterInfo: undefined,
      errors: [],
      newCharacterData: {
        url: marvelWikiUrl,
        customAlias: ""
      },
      characterIsLoading: false
    };
  },
  methods: {
    selectAll(event) {
      event.target.select();
    },
    checkForm() {
      this.characterInfo = undefined;
      this.errors = [];
      const url = this.newCharacterData.url;
      if (!url.trim() || url === marvelWikiUrl) {
        this.errors.push("Please provide url to character");
      } else if (!url.startsWith(marvelWikiUrl)) {
        this.errors.push(`Please provide url to ${marvelWikiUrl} wiki`);
      }
      const alias = this.newCharacterData.customAlias;
      if (alias) {
        if (alias.length > maxAliasLength) {
          this.errors.push(
            `Custom alias max length (${maxAliasLength}) exceeded.`
          );
        }
        if (!aliasRegexp.test(alias)) {
          this.errors.push(
            "Custom alias can only contain a-z letters, numbers and spaces."
          );
        }
      }
      if (!this.errors.length) {
        this.characterIsLoading = true;
        axios
          .post("newCharacter", { characterUrl: url, customAlias: alias })
          .then(response => {
            this.characterInfo = response.data;
          })
          .catch(error => {
            this.errors.push(error.message);
            console.error(error);
          })
          .then(() => {
            this.characterIsLoading = false;
          });
      }
    },
    confirmCharacter() {
      axios
        .post("confirmCharacter", this.characterInfo)
        .then(() => {
          this.$alert("New character saved in database!");
          eventBus.$emit("reloadCharacters");
        })
        .catch(error => {
          this.errors.push(error.message);
          console.log(error);
        });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.characterIsLoading) {
      this.$confirm(
        "Character loading in progress. Are you sure want to leave page?",
        undefined,
        undefined,
        {
          focusCancel: true,
          focusConfirm: false
        }
      ).then(() => {
        next();
      });
    } else {
      next();
    }
  }
};
</script>
<style>
#url {
  width: 20rem;
}

#alias {
  width: 15rem;
}
</style>
