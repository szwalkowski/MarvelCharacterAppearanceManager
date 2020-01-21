<template>
  <div id="app">
    <div class="header">
      <div class="header_container">
        <h1 class="header_title">Marvel Character Appearance</h1>
        <h2 class="header_subtitle">Manager</h2>
      </div>
    </div>
    <McamTopBarNav />
    <div class="container">
      <CharactersBarNav />
      <UniversesBarNav />
      <router-view />
    </div>
    <div id="nav">
      <router-link to="/">Home</router-link>
      |
      <router-link to="/about">About</router-link>
    </div>
  </div>
</template>
<script>
import McamTopBarNav from "@/components/navigation/TopBarNav";
import CharactersBarNav from "@/components/navigation/CharactersBarNav";
import UniversesBarNav from "@/components/navigation/UniversesBarNav";

export default {
  components: {
    McamTopBarNav,
    CharactersBarNav,
    UniversesBarNav
  }
};
</script>
<style></style>
