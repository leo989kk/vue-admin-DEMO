// src/router/dynamic.ts
import { menuToRoutes } from "@/router/menuToRoutes";
import { useUserStore } from "@/stores/user";
import type { Router, RouteRecordRaw } from "vue-router";

let injected = false;
const injectedNames = new Set<string>();

function collectNames(routes: RouteRecordRaw[], set: Set<string>) {
  for (const r of routes) {
    if (r.name) set.add(String(r.name));
    if (r.children?.length) collectNames(r.children, set);
  }
}

export function injectMenuRoutes(router: Router) {
  if (injected) return;

  const user = useUserStore();
  const routes: RouteRecordRaw[] = menuToRoutes(user.menuTree);

  // 记录 names
  collectNames(routes, injectedNames);

  routes.forEach((r) => router.addRoute("root", r));
  injected = true;
}

/**
 * 退出/切换账号时调用：移除所有注入过的路由
 */
export function removeInjectedRoutes(router: Router) {
  // 注意：removeRoute 只能按 name 移除
  injectedNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });

  injectedNames.clear();
  injected = false;
}
