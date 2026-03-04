// src/stores/user.ts
import { apiClient, unwrapData } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { MenuNode } from "@/types/menu";
import { defineStore } from "pinia";

/**
 * 权限点（Permission Code）示例：
 * - user:list   查看用户列表
 * - user:create 创建用户
 * - user:edit   编辑用户
 */
export type PermissionCode = string;
type MeResp = {
  id: number;
  name: string;
  roles: string[];
  permissions: PermissionCode[];
};
// 用户与权限仓库
export const useUserStore = defineStore("user", {
  state: () => ({
    id: 0,
    name: "",
    // 角色（可选）
    roles: ["admin"] as string[],

    // 权限点列表（后续可以从后端接口拿）
    permissions: [
      // "dashboard:view",
      // "user:list",
      // "user:create",
      // "user:edit",
    ] as PermissionCode[],
    loaded: false,

    menuLoaded: false,
    menuTree: [] as any[],
  }),

  getters: {
    // 是否拥有某权限点
    hasPermission: (state) => (code: PermissionCode) =>
      state.permissions.includes(code),

    // 是否拥有任意一个权限点（常用于按钮/菜单显示）
    hasAnyPermission: (state) => (codes: PermissionCode[]) =>
      codes.some((c) => state.permissions.includes(c)),
  },

  actions: {
    async loadMe() {
      // 已加载过就不重复拉（可选）
      if (this.loaded) return;

      const resp = await apiClient.get<ApiResponse<MeResp>>("/me");
      const me = unwrapData(resp.data);

      this.id = me.id;
      this.name = me.name;
      this.roles = me.roles;
      this.permissions = me.permissions;
      this.loaded = true;
    },
    async loadMenu() {
      // 已加载过就不重复拉（可选）
      if (this.menuLoaded) return;

      const resp = await apiClient.get<ApiResponse<MenuNode[]>>("/menu");
      const menu = unwrapData(resp.data);

      this.menuTree = menu;
      this.menuLoaded = true;
    },
    reset() {
      this.id = 0;
      this.name = "";
      this.roles = [];
      this.permissions = [];
      this.loaded = false;
      this.menuLoaded = false;
      this.menuTree = [];
    },

    // 后续接后端时：把权限点覆盖进来即可
    setPermissions(perms: PermissionCode[]) {
      this.permissions = perms;
    },

    /**
     * 模拟“登录后拉权限”
     * 真实项目：这里会调用 API：GET /me 或 GET /permissions
     * 然后 setPermissions(返回的权限点列表)
     */
    async loadPermissions() {
      // 已经有权限就不重复加载（可选）
      if (this.permissions.length > 0) return;

      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, 300));

      // ✅ mock 返回：你可以随时改成不同角色的权限集来测试
      this.permissions = [
        "dashboard:view",
        "user:list",
        "user:create",
        "user:edit",
        // "user:delete", // 打开这行，你会发现“删除按钮”出现
      ];
    },
  },
});
