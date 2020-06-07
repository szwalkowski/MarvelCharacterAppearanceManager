import Vue from "vue";
import VueRouter from "vue-router";
import firebase from "firebase/app";
import "firebase/auth";
import Home from "../views/Home.vue";
import store from "./../store/store";

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
    component: () => import("../views/NewCharacter"),
    meta: {
      admin: true
    }
  },
  {
    path: "/dictionary",
    name: "dictionary",
    component: () => import("../views/Dictionary"),
    meta: {
      admin: true
    }
  },
  {
    path: "/character",
    name: "character",
    component: () => import("../views/Character")
  },
  {
    path: "/log-in",
    name: "log-in",
    component: () => import("../views/LogIn"),
    meta: {
      guest: true
    }
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
  },
  {
    path: "/account",
    name: "account",
    component: () => import("../views/Account"),
    meta: {
      auth: true
    }
  }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        next();
      } else {
        next({
          path: "/log-in"
        });
      }
    });
  } else if (to.matched.some(record => record.meta.guest)) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        next({
          path: "/account"
        });
      } else {
        next();
      }
    });
  } else if (to.matched.some(record => record.meta.admin)) {
    const userType = store.state.user.userMcamSession.userType;
    if (userType === "Admin") {
      next();
    }
  } else {
    next();
  }
});

export default router;
