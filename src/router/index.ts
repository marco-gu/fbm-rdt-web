import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import PageView from "../views/PageView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "PageView",
    component: PageView,
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHistory(),
  routes,
});

export default router;
