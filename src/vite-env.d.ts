// 引入 Vite 客户端类型（import.meta.env 等）
/// <reference types="vite/client" />

// 让 TypeScript 识别 .vue 单文件组件模块
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
