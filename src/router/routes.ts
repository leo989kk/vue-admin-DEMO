// src/router/routes.ts
import type { RouteRecordRaw } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";
import ForbiddenPage from "@/pages/ForbiddenPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";

import RouteView from "@/layouts/RouteView.vue";
import HomePage from "@/pages/HomePage.vue";
import UserDetailPage from "@/pages/UserDetailPage.vue";
import UserListPage from "@/pages/UserListPage.vue";

/**
 * ✅ 静态路由：任何环境都存在（不随权限变化）
 */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { public: true, title: "登录" },
  },
  {
    path: "/403",
    name: "forbidden",
    component: ForbiddenPage,
    meta: { public: true, title: "403" },
  },
  {
    path: "/404",
    name: "notFound",
    component: NotFoundPage,
    meta: { public: true, title: "404" },
  },

  // ✅ Layout 根节点：业务路由会动态挂到它的 children
  {
    path: "/",
    name: "root",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [], // 注意：先空，后面动态 addRoute 进去
  },

  // 兜底放最后
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { public: true },
  },
];

/**
 * ✅ 动态业务路由：会按权限过滤后再注入
 * 这里先写死在前端（真实项目可能后端直接下发菜单/路由表）
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "",
    name: "home",
    component: HomePage,
    meta: {
      requiresAuth: true,
      title: "首页",
      icon: "House",
      permissions: ["dashboard:view"],
    },
  },
  {
    path: "users",
    name: "usersRoot",
    component: RouteView,
    meta: {
      requiresAuth: true,
      title: "用户管理",
      icon: "User",
      permissions: ["user:list"],
    },
    children: [
      {
        path: "",
        name: "users",
        component: UserListPage,
        meta: {
          requiresAuth: true,
          // 列表页不写 title，避免面包屑重复
          permissions: ["user:list"],
        },
      },
      {
        path: ":id",
        name: "userDetail",
        component: UserDetailPage,
        meta: {
          requiresAuth: true,
          title: "用户详情",
          hidden: true,
          permissions: ["user:list"],
        },
      },
    ],
  },
];
