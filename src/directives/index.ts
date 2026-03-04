// src/directives/index.ts
import type { App } from "vue";
import { permissionDirective } from "./permission";

// 统一注册全局自定义指令
export function setupDirectives(app: App) {
  app.directive("permission", permissionDirective);
}
