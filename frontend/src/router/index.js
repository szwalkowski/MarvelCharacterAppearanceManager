import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "*",
    name: "home",
    component: Home
  },
  {
    path: "/add-new-character",
    name: "new-character",
    component: () => import("../views/NewCharacter")
  },
  {
    path: "/dictionary",
    name: "dictionary",
    component: () => import("../views/Dictionary")
  },
  {
    path: "/issues",
    name: "issues",
    component: () => import("../views/Issues")
  },
  {
    path: "/sign-up",
    name: "sign-up",
    component: () => import("../views/SignUp")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
