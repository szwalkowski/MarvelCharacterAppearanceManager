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
          <div v-if="characterInfo" class="col-3">
            <label for="displayName">Display name: </label>
            <input
              type="text"
              id="displayName"
              class="form-control"
              v-model.trim="characterInfo.DisplayName"
            />
          </div>
        </div>
      </form>
    </fieldset>
    <div v-if="characterInfo" class="row">
      <table class="table table-dark">
        <tr>
          <th>Real name</th>
          <th>Aliases</th>
          <th>Universe</th>
          <th>Appearances</th>
          <th>Minor appearances</th>
          <th>Image</th>
        </tr>
        <tr>
          <td>{{ characterInfo.RealName }}</td>
          <td>{{ characterInfo.Aliases.join(", ") }}</td>
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

const marvelWikiUrl = "https://marvel.fandom.com/wiki/";
const maxDisplayNameLength = 20;
const displayNameRegexp = /^[a-zA-Z0-9-. ]+$/;
const urlStartRegex = /^https:\/\/|http:\/\/|www./i;

export default {
  data() {
    return {
      characterInfo: undefined,
      errors: [],
      newCharacterData: {
        url: marvelWikiUrl
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
      if (!this.errors.length && !urlStartRegex.test(url)) {
        url = marvelWikiUrl + encodeURI(url.replace(/ /g, "_"));
      }
      if (!this.errors.length) {
        this.characterIsLoading = true;
        axios
          .post(
            "newCharacter",
            { characterUrl: url },
            { mcamAuthenticated: true }
          )
          .then(response => {
            this.characterInfo = response.data;
          })
          .catch(error => {
            this.errors.push(error.response.data);
            console.error(error);
          })
          .then(() => {
            this.characterIsLoading = false;
          });
      }
    },
    confirmCharacter() {
      this.errors = [];
      const displayName =
        this.characterInfo.DisplayName && this.characterInfo.DisplayName.trim();
      if (displayName) {
        if (displayName.length > maxDisplayNameLength) {
          this.errors.push(
            `Display name max length (${maxDisplayNameLength}) exceeded.`
          );
        }
        if (!displayNameRegexp.test(displayName)) {
          this.errors.push(
            "Display name can only contain a-z letters, numbers, spaces, dots and dashes."
          );
        }
      }
      if (!this.errors.length) {
        axios
          .post("confirmCharacter", this.characterInfo, {
            mcamAuthenticated: true
          })
          .then(() => {
            this.$alert("New character request sent!");
            this.characterInfo = null;
          })
          .catch(error => {
            this.errors.push(error.response.data);
            console.log(error);
          });
      }
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
