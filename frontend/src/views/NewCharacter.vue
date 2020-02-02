<template>
  <div>
    <fieldset>
      <div v-if="errors.length" style="color: red">
        <b>Please correct the following error(s):</b>
        <br />
        <ul style="padding-left: 1rem">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <form @submit.prevent="checkForm">
        <div class="form-group row">
          <button type="submit" class="btn btn-dark">Upload character</button>
          <div class="col-5">
            <label for="url">Url to new character: </label>
            <input
              type="text"
              class="form-control"
              id="url"
              v-model="newCharacterData.url"
              @click="selectAll($event)"
              name="url"
            />
          </div>
          <div class="col-3">
            <label for="alias">Custom alias: </label>
            <input
              type="text"
              id="alias"
              class="form-control"
              v-model="newCharacterData.customAlias"
            />
          </div>
        </div>
      </form>
    </fieldset>
    <div v-if="characterInfo" class="row">
      <table class="table table-dark">
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

      <button class="btn btn-dark btn-lg" @click="confirmCharacter">
        Confirm
      </button>
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
