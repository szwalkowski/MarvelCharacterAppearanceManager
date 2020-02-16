<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary pl-sm-4">
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link tag="a" class="nav-link" to="/add-new-character">
            Add new character
          </router-link>
        </li>
        <li class="nav-item dropdown">
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
        <template v-if="!userName">
          <router-link tag="a" class="nav-link pr-sm-1" to="/log-in">
            Log in
          </router-link>
          /
          <router-link tag="a" class="nav-link pl-sm-1" to="/sign-up">
            Sign up
          </router-link>
        </template>
        <template v-else>
          <router-link tag="a" class="nav-link pl-sm-1" to="/account">
            Hello, {{ userName }}!
          </router-link>
        </template>
      </ul>
    </div>
  </nav>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("user", ["userName"])
  }
};
</script>
