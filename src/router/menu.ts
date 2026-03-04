import { useUserStore } from "@/stores/user";
import type { RouteRecordNormalized, RouteRecordRaw } from "vue-router";

type MenuRoute = RouteRecordRaw | RouteRecordNormalized;

// 侧边菜单项结构
export type MenuItem = {
  path: string;
  title: string;
  icon?: string;
};

/**
 * 判断某路由对当前用户是否可见（用于菜单）
 * 规则与路由守卫保持一致：
 * - meta.title 必须存在（否则不做菜单）
 * - meta.hidden=true 则不出现在菜单
 * - meta.permissions 存在则要求用户具备任意一个权限点
 */
function canShowInMenu(route: MenuRoute): boolean {
  const user = useUserStore();
  const meta = (route.meta ?? {}) as any;

  // 公开页（login/403/404 等）不进入侧边菜单
  if (meta.public === true) return false;

  const title = meta.title as string | undefined;
  if (!title) return false;

  // ✅ 隐藏页：不出现在菜单（但不代表无权限）
  if (meta.hidden === true) return false;

  const perms = (meta.permissions as string[] | undefined) ?? [];
  if (perms.length === 0) return true;

  return user.hasAnyPermission(perms);
}

export function buildMenuFromRoutes(
  allRoutes: readonly MenuRoute[],
): MenuItem[] {
  // 动态路由场景下，path="/" 可能有多条记录（如 root + home），优先按 name 找 root
  const layout =
    allRoutes.find((r) => r.name === "root") ??
    allRoutes.find((r) => r.path === "/" && Array.isArray(r.children));
  // getRoutes() 结果常为扁平结构，root.children 可能为空；为空时回退到全量路由过滤
  const candidates =
    layout?.children && layout.children.length > 0 ? layout.children : allRoutes;

  // 输出菜单数组
  const menu: MenuItem[] = [];

  // 遍历布局子路由并按规则过滤可见菜单
  for (const r of candidates) {
    if (!canShowInMenu(r)) continue;

    const meta = (r.meta ?? {}) as any;
    const title = meta.title as string;
    const icon = meta.icon as string | undefined;

    // 兼容绝对路径与相对路径，避免拼出 "//users"
    const path = r.path.startsWith("/") ? r.path : r.path ? `/${r.path}` : "/";
    menu.push({ path, title, icon });
  }

  return menu;
}
