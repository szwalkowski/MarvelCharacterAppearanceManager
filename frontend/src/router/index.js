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
    path: "/character",
    name: "character",
    component: () => import("../views/Character")
  },
  {
    path: "/sign-up",
    name: "sign-up",
    component: () => import("../views/SignUp")
  },
  {
    path: "/log-in",
    name: "log-in",
    component: () => import("../views/LogIn")
  },
  {
    path: "/characters",
    name: "characters",
    component: () => import("../views/CharacterList")
  },
  {
    path: "/issues",
    name: "issues",
    component: () => import("../views/IssueList")
  },
  {
    path: "/issue",
    name: "issue",
    component: () => import("../views/Issue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
