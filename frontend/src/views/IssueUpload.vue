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
      <div class="form-group row">
        <button class="btn btn-primary" @click="uploadIssue">
          Upload issue
        </button>
        <div class="col-5">
          <label for="url">Url or ID of issue: </label>
          <input
            id="url"
            v-model="issueUrl"
            type="text"
            class="form-control"
            name="url"
          />
        </div>
      </div>
    </fieldset>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      errors: [],
      issueUrl: ""
    };
  },
  methods: {
    uploadIssue() {
      this.errors = [];
      if (!this.errors.length) {
        axios
          .post(
            "uploadIssue",
            { issueUrl: this.issueUrl },
            {
              mcamAuthenticated: true
            }
          )
          .then(() => {
            this.$alert("Upload finished!");
          })
          .catch(error => {
            this.errors.push(error.response.data);
            console.log(error);
          });
      }
    }
  }
};
</script>
