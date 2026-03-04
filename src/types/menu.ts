// src/types/menu.ts
export type MenuNode = {
  path: string; // 子路径："" / "users" / ":id"
  name?: string; // 路由 name（建议给）
  title?: string; // 用于菜单/面包屑
  icon?: string; // Element Plus icon key
  hidden?: boolean; // 不在菜单显示
  component?: string; // 组件名映射（前端决定实际 import）
  permissions?: string[]; // 权限点
  children?: MenuNode[];
};
