import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MainView from "../views/MainView.vue";
import ProfileView from "../views/ProfileView.vue";
import LpSearchView from "../views/LpSearchView.vue";
import ScanView from "../views/ScanView.vue";
import ResetPwdView from "../views/ResetPwdView.vue";
import MixCartonView from "../views/MixCartonView.vue";
import bridge from "dsbridge";
import SettingView from "../views/SettingView.vue";
import LanguageView from "../views/LanguageView.vue";
import RingVoiceView from "../views/RingVoiceView.vue";
import ScanDeviceView from "../views/ScanDeviceView.vue";
import CartonDetailView from "../views/CartonDetailView.vue";
import ProfileManagementView from "../views/ProfileManagementView.vue";
import LPListView from "../views/LPListView.vue";
import LPDetailListView from "../views/LPDetailListView.vue";
import DataManagementView from "../views/DataManagementView.vue";

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
    path: "/resetPwd",
    name: "resetPwd",
    component: ResetPwdView,
  },
  {
    path: "/profile/:id",
    name: "profile",
    children: [
      { path: "online", name: "profileOnline", component: ProfileView },
      { path: "offline", name: "profileOffline", component: ProfileView },
    ],
    component: ProfileView,
  },
  {
    path: "/lpSearch/:id",
    name: "lpSearch",
    children: [
      { path: "online", name: "lpSearchOnline", component: LpSearchView },
      { path: "offline", name: "lpSearchOffline", component: LpSearchView },
    ],
    component: LpSearchView,
  },
  {
    path: "/scan/:id",
    name: "scan",
    children: [
      { path: "online", name: "scanOnline", component: ScanView },
      { path: "offline", name: "scanOffline", component: ScanView },
    ],
    component: ScanView,
  },
  {
    path: "/mixCarton",
    name: "mixCarton",
    component: MixCartonView,
  },
  {
    path: "/cartonDetail",
    name: "cartonDetail",
    component: CartonDetailView,
  },
  {
    path: "/setting",
    name: "setting",
    component: SettingView,
  },
  {
    path: "/settingLanguage",
    name: "settingLanguage",
    component: LanguageView,
  },
  {
    path: "/ringVoice",
    name: "ringVoice",
    component: RingVoiceView,
  },
  {
    path: "/settingScanDevice",
    name: "scanDevice",
    component: ScanDeviceView,
  },
  {
    path: "/profileManagement",
    name: "profileManagement",
    component: ProfileManagementView,
  },
  {
    path: "/lpList",
    name: "lpList",
    component: LPListView,
  },
  {
    path: "/lpDetailList",
    name: "lpDetailList",
    component: LPDetailListView,
  },
  {
    path: "/dataManagement",
    name: "dataManagement",
    component: DataManagementView,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});
// fix defect #6
let fromPath = "/";
router.beforeEach((to, from, next) => {
  if (to.path == "mixcarton") {
    next("/mixCarton");
  }
  if (to.path == "cartonDetail") {
    next("/cartonDetail");
  }
  fromPath = from.path;
  if (from.path == "/" && to.path == "/") {
    bridge.call("fetchUserToken", null, (res: string) => {
      if (res) {
        next("home");
      } else {
        next();
      }
    });
  }
  if (from.path == "/home" && to.path == "/") {
    bridge.call("fetchUserToken", null, (res: string) => {
      if (res) {
        return false;
      } else {
        next();
      }
    });
  } else if (from.path == "/resetPwd" && to.path == "/") {
    bridge.call("fetchUserToken", null, (res: string) => {
      if (res) {
        return next("/resetPwd");
      } else {
        next();
      }
    });
  } else if (from.path != "/" && to.path == "/") {
    next(fromPath);
  } else {
    next();
  }
  if (from.path == "/setting" && to.path == "/home") {
    next({ path: "/home", query: { leftDrawerOpen: "true" } });
  }
});

export default router;
