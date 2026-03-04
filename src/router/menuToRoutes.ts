// src/router/menuToRoutes.ts
import RouteView from "@/layouts/RouteView.vue";
import type { MenuNode } from "@/types/menu";
import type { RouteRecordRaw } from "vue-router";

// 组件映射：后端下发 component 字符串，前端映射到真实组件
import HomePage from "@/pages/HomePage.vue";
import UserDetailPage from "@/pages/UserDetailPage.vue";
import UserListPage from "@/pages/UserListPage.vue";

// ✅ 你后续加新页面，就在这里加映射
const componentMap: Record<string, any> = {
  HomePage,
  UserListPage,
  UserDetailPage,
};

function resolveComponent(name?: string) {
  if (!name) return RouteView;
  return componentMap[name] ?? RouteView;
}

/**
 * menu tree -> vue-router routes
 */
export function menuToRoutes(menu: MenuNode[]): RouteRecordRaw[] {
  return menu.map((n) => {
    const baseRoute: RouteRecordRaw = {
      path: n.path,
      name: n.name,
      component: resolveComponent(n.component),
      meta: {
        requiresAuth: true,
        title: n.title,
        icon: n.icon,
        hidden: n.hidden,
        permissions: n.permissions ?? [],
      },
    };

    if (n.children?.length) {
      // 父节点有子路由时，直接返回带 children 的对象，避免联合类型赋值冲突
      return {
        ...baseRoute,
        component: RouteView,
        children: menuToRoutes(n.children),
      };
    }

    return baseRoute;
  });
}
