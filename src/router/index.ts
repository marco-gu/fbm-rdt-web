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
import SettingLanguageView from "../views/SettingLanguageView.vue";
import SettingRingVoiceView from "../views/SettingRingVoiceView.vue";
import SettingScanDeviceView from "../views/SettingScanDeviceView.vue";
import CartonDetailView from "../views/CartonDetailView.vue";
import ProfileManagementView from "../views/ProfileManagementView.vue";
import LPListView from "../views/LPListView.vue";
import LPDetailListView from "../views/LPDetailListView.vue";
import DataManagementView from "../views/DataManagementView.vue";
import DataMgmtGDView from "../views/DataMgmtGDView.vue";
import DataMgmtGDEditView from "../views/DataMgmtGDEditView.vue";
import DataManagementMixCartonView from "../views/DataManagementMixCartonView.vue";
import DataManagementMixCartonListView from "../views/DataManagementMixCartonListView.vue";
import MyJobsView from "../views/MyJobsView.vue";
import ImageAccessView from "../views/ImageAccessView.vue";
import CargoImageView from "../views/CargoImageView.vue";
import SoftwareUpdateView from "../views/SoftwareUpdateView.vue";
import NativeBridgeView from "../views/NativeBridgeView.vue";
import NewLoginView from "../views/NewLoginView.vue";
import NewMainView from "../views/NewMainView.vue";
const routes: Array<RouteRecordRaw> = [
  // {
  //   path: "/",
  //   name: "login",
  //   component: LoginView,
  //   meta: { isLogin: true },
  // },
  {
    path: "/",
    name: "login",
    component: NewLoginView,
    meta: { isLogin: true },
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    // children: [{ path: "", name: "main", component: MainView }],
    children: [{ path: "", name: "main", component: NewMainView }],
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
    path: "/scan",
    name: "scan",
    component: ScanView,
  },
  {
    path: "/mixCarton/:id",
    name: "mixCarton",
    component: MixCartonView,
  },
  {
    path: "/cartonDetail/:id",
    name: "cartonDetail",
    component: CartonDetailView,
  },
  {
    path: "/setting",
    name: "setting",
    component: SettingView,
  },
  {
    path: "/setting-language",
    name: "settingLanguage",
    component: SettingLanguageView,
  },
  {
    path: "/setting-ring-voice",
    name: "ringVoice",
    component: SettingRingVoiceView,
  },
  {
    path: "/setting-scan-device",
    name: "scanDevice",
    component: SettingScanDeviceView,
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
  {
    path: "/dataMgmtGD",
    name: "dataMgmtGD",
    component: DataMgmtGDView,
  },
  {
    path: "/dataMgmtGDEdit",
    name: "dataMgmtGDEdit",
    component: DataMgmtGDEditView,
  },
  {
    path: "/dataManagementMixCarton",
    name: "dataManagementMixCarton",
    component: DataManagementMixCartonView,
  },
  {
    path: "/dataManagementMixCartonList",
    name: "dataManagementMixCartonList",
    component: DataManagementMixCartonListView,
  },
  {
    path: "/continueJobs",
    name: "MyJobs",
    component: MyJobsView,
  },
  {
    path: "/imageAccess",
    name: "imageAccess",
    component: ImageAccessView,
  },
  {
    path: "/cargoImage",
    name: "cargoImage",
    component: CargoImageView,
  },
  {
    path: "/software-update",
    name: "SoftwareUpdateView",
    component: SoftwareUpdateView,
  },
  {
    path: "/nativeBridge",
    name: "NativeBridgeView",
    component: NativeBridgeView,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

// fix defect #6
// let fromPath = "/";
// router.beforeEach((to, from, next) => {
//   if (to.path == "mixcarton") {
//     next("/mixCarton");
//   }
//   if (to.path == "cartonDetail") {
//     next("/cartonDetail");
//   }
//   fromPath = from.path;
//   if (from.path == "/" && to.path == "/") {
//     bridge.call("fetchUserToken", null, (res: string) => {
//       if (res) {
//         next("home");
//       } else {
//         next();
//       }
//     });
//   }
//   if (from.path == "/home" && to.path == "/") {
//     bridge.call("fetchUserToken", null, (res: string) => {
//       if (res) {
//         return false;
//       } else {
//         next();
//       }
//     });
//   } else if (from.path == "/resetPwd" && to.path == "/") {
//     bridge.call("fetchUserToken", null, (res: string) => {
//       if (res) {
//         return next("/resetPwd");
//       } else {
//         next();
//       }
//     });
//   } else if (from.path != "/" && to.path == "/") {
//     next(fromPath);
//   } else {
//     next();
//   }
//   if (from.path == "/setting" && to.path == "/home") {
//     next({ path: "/home", query: { leftDrawerOpen: "true" } });
//   }
// });

export default router;
