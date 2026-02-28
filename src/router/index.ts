import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomePage from "../pages/HomePage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomePage },
];
export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
