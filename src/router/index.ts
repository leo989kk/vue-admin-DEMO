// 路由组件导入
import { createRouter, createWebHashHistory } from "vue-router";
import { staticRoutes } from "./routes";

// 导出路由实例
export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
});
