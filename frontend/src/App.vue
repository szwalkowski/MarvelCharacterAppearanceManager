<template>
  <div id="app">
    <div class="header_div">
      <div class="header_container">
        <h1 class="header header_title" @click="navigateToHome">
          Marvel Character Appearance
        </h1>
        <h2 class="header header_subtitle" @click="navigateToHome">
          Manager
        </h2>
      </div>
    </div>
    <McamTopBarNav />
    <div class="container">
      <CharactersBarNav />
      <UniversesBarNav />
      <router-view class="landing-container"/>
    </div>
  </div>
</template>
<script>
import McamTopBarNav from "@/components/navigation/TopBarNav";
import CharactersBarNav from "@/components/navigation/CharactersBarNav";
import UniversesBarNav from "@/components/navigation/UniversesBarNav";

export default {
  methods: {
    navigateToHome() {
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
    }
  },
  components: {
    McamTopBarNav,
    CharactersBarNav,
    UniversesBarNav
  }
};
</script>
<style>
.header_div {
  background: #640a14;
  color: #989898;
  padding: 1.3rem 0;
}

.header_container {
  max-width: 65rem;
  margin: 0 auto;
  padding: 0 1.6rem;
}

.header {
  cursor: pointer;
  width: fit-content;
}

.header_title {
  font-size: 3.3rem;
  margin-bottom: 0.4rem;
}

.header_subtitle {
  font-size: 1.6rem;
  font-weight: 300;
}
</style>
