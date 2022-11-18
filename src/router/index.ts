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
  {
    path: "/mixCarton",
    name: "mixCarton",
    component: MixCartonView,
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
