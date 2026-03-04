// 应用入口：创建 Vue 实例并挂载全局能力
import { createApp } from "vue";
import App from "./App.vue";

// 注册路由与状态管理
import { router } from "@/router";
import { pinia } from "@/stores";

// 注册 UI 组件库
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// 注册全局路由守卫
import { setupRouterGuards } from "@/router/guards";
// 注册全局自定义指令
import { setupDirectives } from "@/directives";

// 创建应用实例
const app = createApp(App);

// 安装插件
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 启用导航鉴权逻辑
setupRouterGuards(router);
// 启用全局自定义指令（如 v-permission）
setupDirectives(app);

// 挂载到 DOM
app.mount("#app");
