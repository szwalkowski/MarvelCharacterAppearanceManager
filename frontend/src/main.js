import Vue from "vue";
import VueSimpleAlert from "vue-simple-alert";
import App from "./App.vue";
import Vuelidate from "vuelidate";
import router from "./router";
import axios from "axios";
import store from "./store/store";
import VModal from "vue-js-modal";

Vue.config.productionTip = false;
axios.defaults.baseURL = "http://localhost:3000";
export const eventBus = new Vue();
Vue.use(VueSimpleAlert);
Vue.use(Vuelidate);
Vue.use(VModal, { dynamic: true, injectModalsContainer: true });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
