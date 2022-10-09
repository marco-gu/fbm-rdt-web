import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MainView from "../views/MainView.vue";
import ProfileView from "../views/ProfileView.vue";
import LpSearchView from "../views/LpSearchView.vue";
import ScanView from "../views/ScanView.vue";
import ChangePasswordView from "../views/ChangePasswordView.vue";
import bridge from "dsbridge";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { isLogin: true },
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    children: [{ path: "", name: "main", component: MainView }],
  },
  {
    path: "/changePassword",
    name: "changePassword",
    component: ChangePasswordView,
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
  },
  {
    path: "/lpSearch",
    name: "lpSearch",
    component: LpSearchView,
  },
  {
    path: "/scan",
    name: "scan",
    component: ScanView,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});
// fix defect #6
let fromPath = "/";
router.beforeEach((to, from, next) => {
  if (from.path == "/home" && to.path == "/") {
    bridge.call("fetchUserToken", null, (res: string) => {
      if (res) {
        fromPath = "/home";
        return false;
      } else {
        next();
      }
    });
  } else if (from.path != "/" && to.path == "/") {
    next(fromPath);
  } else {
    next();
  }
});

export default router;
