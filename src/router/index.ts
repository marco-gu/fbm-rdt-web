import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MainView from "../views/MainView.vue";
import ProfileView from "../views/ProfileView.vue";
import LpSearchView from "../views/LpSearchView.vue";
import ScanView from "../views/ScanView.vue";
import ChangePasswordView from "../views/ChangePasswordView.vue";
import UserManualView from "../views/UserManualView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: LoginView,
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

export default router;
