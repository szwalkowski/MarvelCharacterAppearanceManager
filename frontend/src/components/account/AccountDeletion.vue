<template>
  <div class="card horizontal p-sm-2">
    <p>All data related to what you have read will be forgotten!</p>
    <p>Are you sure you want to delete account?</p>
    <p v-if="showError" class="alert-danger text-white font-weight-bolder">
      ! Please log out and log in back before removing account !
    </p>
    <button v-else class="btn btn-primary col-sm-1" @click="removeAccount">
      YES
    </button>
  </div>
</template>
<script>
import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      showError: false
    };
  },
  computed: {
    ...mapGetters("user", ["user"])
  },
  methods: {
    ...mapActions("user", ["getIdToken"]),
    async removeAccount() {
      const idToken = await this.getIdToken();
      const currentUser = firebase.auth().currentUser;
      currentUser
        .delete()
        .then(() => {
          axios.delete("/user", {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          });
        })
        .catch(() => {
          this.showError = true;
        });
    }
  }
};
</script>
