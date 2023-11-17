import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import PageView from "../views/PageView.vue";
import GenericSettingView from "../views/options/GenericSettingView.vue";
import ServerSelectionView from "../views/options/ServerSelectionView.vue";
import OptionsView from "../views/options/OptionsView.vue";
import OptionDetailsView from "../views/options/OptionDetailsView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "PageView",
    component: PageView,
    children: [
      {
        path: "/options/",
        name: "OptionsView",
        component: OptionsView,
        children: [
          {
            path: "",
            name: "OptionDetailsView",
            component: OptionDetailsView,
          },
          {
            path: "setting",
            name: "GenericSettingView",
            component: GenericSettingView,
          },
          {
            path: "serverSelection",
            name: "ServerSelectionView",
            component: ServerSelectionView,
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

export default router;
