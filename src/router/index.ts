import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import ShellView from "../views/ShellView.vue";
import RDTView from "@/views/RDTView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Shell",
    component: ShellView,
    // children: [
    //   {
    //     path: "/options/",
    //     name: "OptionsView",
    //     component: OptionsView,
    //     children: [
    //       {
    //         path: "",
    //         name: "OptionDetailsView",
    //         component: OptionDetailsView,
    //       },
    //       {
    //         path: "setting",
    //         name: "GenericSettingView",
    //         component: GenericSettingView,
    //       },
    //       {
    //         path: "serverSelection",
    //         name: "ServerSelectionView",
    //         component: ServerSelectionView,
    //       },
    //     ],
    //   },
    // ],
  },
  {
    path: "/rdt",
    name: "RDTView",
    component: RDTView,
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

export default router;
