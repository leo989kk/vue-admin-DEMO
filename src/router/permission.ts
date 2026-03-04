// src/router/permission.ts
import { useUserStore } from "@/stores/user";
import type { RouteRecordRaw } from "vue-router";

/**
 * 判断当前用户是否有权限访问该路由
 * - meta.permissions 不存在 => 允许
 * - 存在 => 需要满足任意一个权限点
 */
function canAccess(route: RouteRecordRaw): boolean {
  const user = useUserStore();
  const meta = (route.meta ?? {}) as any;
  const perms = (meta.permissions as string[] | undefined) ?? [];
  if (perms.length === 0) return true;
  return user.hasAnyPermission(perms);
}

/**
 * 深拷贝+过滤（避免污染原 asyncRoutes）
 */
export function filterRoutesByPermission(
  routes: RouteRecordRaw[],
): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];

  for (const r of routes) {
    if (!canAccess(r)) continue;

    const copy: RouteRecordRaw = { ...r };

    if (r.children && r.children.length > 0) {
      copy.children = filterRoutesByPermission(r.children);
    }

    result.push(copy);
  }

  return result;
}
