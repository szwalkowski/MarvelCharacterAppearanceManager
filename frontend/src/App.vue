<template>
  <div id="app">
    <div class="container-sm">
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
      <div>
        <CharactersBarNav class="row" />
        <router-view />
      </div>
    </div>
    <PageFooter />
  </div>
</template>
<script>
import "vue-loading-overlay/dist/vue-loading.css";
import McamTopBarNav from "@/components/navigation/TopBarNav";
import CharactersBarNav from "@/components/navigation/CharactersBarNav";
import PageFooter from "@/components/navigation/PageFooter";

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
    PageFooter
  },
  created() {
    this.$store.dispatch("user/initFirebase");
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
