<template>
  <nav class="navbar navbar-expand-sm navbar-dark bg-primary pl-sm-4">
    <div class="navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link tag="a" class="nav-link" to="/characters">
            Characters
          </router-link>
        </li>
        <li class="nav-item">
          <router-link tag="a" class="nav-link" to="/issues">
            Issues
          </router-link>
        </li>
        <li v-if="userMcamSession.userType === 'Admin'" class="nav-item">
          <router-link tag="a" class="nav-link" to="/add-new-character">
            Add new character
          </router-link>
        </li>
        <li v-if="userMcamSession.userType === 'Admin'" class="nav-item">
          <a class="nav-link" style="cursor: pointer;" @click="feedUpdate">
            Feed update
          </a>
        </li>
        <li
          v-if="userMcamSession.userType === 'Admin'"
          class="nav-item dropdown"
        >
          <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
            Dictionaries
          </a>
          <div class="dropdown-menu">
            <router-link
              tag="a"
              class="nav-link ml-sm-1"
              to="/dictionary?type=focusType"
            >
              Focus types
            </router-link>
            <router-link
              tag="a"
              class="nav-link ml-sm-1"
              to="/dictionary?type=appearanceType"
            >
              Appearances
            </router-link>
          </div>
        </li>
      </ul>
      <ul class="form-inline navbar-nav">
        <template v-if="!user">
          <router-link tag="a" class="nav-link pr-sm-1" to="/log-in">
            Log in
          </router-link>
        </template>
        <template v-else>
          <router-link tag="a" class="nav-link pl-sm-1" to="/account">
            Hello, {{ user.displayName }}!
          </router-link>
          /
          <a class="nav-link pl-sm-1" style="cursor: pointer" @click="logOut">
            Log out
          </a>
        </template>
      </ul>
    </div>
  </nav>
</template>
<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapGetters("user", ["user", "userMcamSession"])
  },
  methods: {
    ...mapActions("user", ["logOut"]),
    feedUpdate() {
      axios
        .get("feedUpdate", {
          mcamAuthenticated: true
        })
        .then(response => {
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>
