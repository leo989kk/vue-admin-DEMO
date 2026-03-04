// src/router/guards.ts
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import type { Router } from "vue-router";
import { injectMenuRoutes } from "./dynamic";

/**
 * 在这里统一注册路由守卫
 * - 未登录访问需要登录的页面 => 跳转到 /login，并携带 redirect
 * - 已登录访问 /login => 直接回首页
 */
export function setupRouterGuards(router: Router) {
  // 全局前置守卫：统一处理登录态、权限和标题
  router.beforeEach(async (to) => {
    // 根据路由 meta.title 动态设置页面标题
    const title = (to.meta.title as String | undefined) ?? "";
    document.title = title ? `${title} - Vue Admin Pro` : "Vue Admin Pro";

    const auth = useAuthStore();
    const user = useUserStore();

    // 提取路由元信息，便于后续判断
    const isPublic = Boolean(to.meta.public);
    const requiresAuth = Boolean(to.meta.requiresAuth);

    // 1) 已登录还去登录页：不允许（避免重复登录）
    if (to.path === "/login" && auth.isAuthed) {
      return { path: "/" };
    }

    // 2) 公开页面：允许访问
    if (isPublic) return true;

    // 3) 需要登录的页面：没登录就拦截
    if (requiresAuth && !auth.isAuthed) {
      return {
        path: "/login",
        query: { redirect: to.fullPath }, // 记录原本想去哪里
      };
    }

    // 4) 到这里说明：要么不需要登录，要么已经登录
    //    如果已登录且访问的是后台页，我们先确保权限已加载
    if (auth.isAuthed) {
      await user.loadMe(); // 身份/权限（可选）
      await user.loadMenu(); // ✅ 菜单树来自后端
      injectMenuRoutes(router);

      if (!to.name) return to.fullPath;
      // 如果当前路由在注入前不存在，注入后需要 re-enter 一次
      // to.name 为空通常说明没匹配到（或是动态注入前）
      if (!to.name) {
        return to.fullPath;
      }
    }

    // 5) 路由级权限校验：
    //    约定：meta.permissions 是 string[]，只要满足“任意一个”就允许（你也可改成“全部满足”）
    const perms = (to.meta.permissions as string[] | undefined) ?? [];
    if (perms.length > 0) {
      const ok = user.hasAnyPermission(perms);
      if (!ok) {
        return { path: "/403" };
      }
    }

    // 4) 其他情况：放行
    return true;
  });
}
