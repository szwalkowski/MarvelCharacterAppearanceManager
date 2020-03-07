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
          <button type="submit" class="btn btn-primary">
            Upload character
          </button>
          <div class="col-5">
            <label for="url">Url or ID of new character: </label>
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
          <td>{{ characterInfo.Alias }}</td>
          <td>{{ characterInfo.Universe }}</td>
          <td>{{ characterInfo.AppearanceCount }}</td>
          <td>{{ characterInfo.MinorAppearanceCount }}</td>
          <td><a :href="characterInfo.ImageUrl">Image</a></td>
        </tr>
      </table>

      <button class="btn btn-primary btn-lg" @click="confirmCharacter">
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
const urlStartRegex = /^https:\/\/|http:\/\/|www./i;

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
      let url = this.newCharacterData.url.trim();
      if (!url.trim() || url === marvelWikiUrl) {
        this.errors.push("Please provide url or id of character");
      } else if (urlStartRegex.test(url) && !url.startsWith(marvelWikiUrl)) {
        this.errors.push(
          `Please provide url to ${marvelWikiUrl} wiki. Or use character ID.`
        );
      }
      const alias =
        this.newCharacterData.customAlias &&
        this.newCharacterData.customAlias.trim();
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
      if (!this.errors.length && !urlStartRegex.test(url)) {
        url = marvelWikiUrl + encodeURI(url.replace(/ /g, "_"));
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
          this.$alert("New character request sent!");
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
