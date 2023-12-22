import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import ShellView from "../views/ShellView.vue";
import RDTView from "@/views/RDTView.vue";
import TransitionView from "@/views/TransitionView.vue";
import SubFormViewComponent from "@/views/options/SubFormView.vue";
import OptionDetailsView from "@/views/options/OptionDetailsView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Shell",
    component: ShellView,
  },
  {
    path: "/rdt",
    name: "RDTView",
    component: RDTView,
    children: [
      {
        path: "/subForm/",
        name: "SubFormViewComponent",
        component: SubFormViewComponent,
        children: [
          {
            path: "",
            name: "OptionDetailsView",
            component: OptionDetailsView,
          },
          // {
          //   path: "setting",
          //   name: "GenericSettingView",
          //   component: GenericSettingView,
          // },
          // {
          //   path: "serverSelection",
          //   name: "ServerSelectionView",
          //   component: ServerSelectionView,
          // },
        ],
      },
    ],
  },
  {
    path: "/transition",
    name: "TransitionView",
    component: TransitionView,
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

export default router;
