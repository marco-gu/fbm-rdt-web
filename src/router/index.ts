import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NodeView from "../views/NodeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "NodeView",
    component: NodeView,
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHistory(),
  routes,
});

export default router;
