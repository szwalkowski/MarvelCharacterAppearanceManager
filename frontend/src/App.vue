<template>
  <div id="app" class="container-fluid">
    <div class="header_div row">
      <div class="col-sm pl-sm-5 p-sm-3">
        <h1 class="header_title row" @click="navigateToHome">
          MARVEL CHARACTER APPEARANCE
        </h1>
        <h2 class="header_subtitle row" @click="navigateToHome">
          MANAGER
        </h2>
      </div>
    </div>
    <McamTopBarNav class="row" />
    <div class="row flex-xl-nowrap">
      <CharactersBarNav class="col-2 py-4 pl-0" />
      <UniversesBarNav class="col-1 py-4 pl-2" />
      <router-view class="col-9 py-4 pl-4" />
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
  },
  created() {
    this.$store.dispatch("user/initFirebase");
    this.$store.dispatch("user/tryAutoLogIn");
  }
};
</script>
<style>
.header_div {
  background: #640a14;
  color: #989898;
  font-family: "GoldenSentry", serif !important;
}

.header_title {
  font-size: 3.3rem;
  cursor: pointer;
}

.header_subtitle {
  font-size: 1.6rem;
  font-weight: 300;
  cursor: pointer;
}
</style>
