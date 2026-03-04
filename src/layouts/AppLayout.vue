<template>
  <!-- 整个应用的容器组件 -->
  <el-container class="app-shell">
    <!-- 左侧菜单 -->
    <el-aside class="app-aside" :width="app.isCollapsed ? '64px' : '220px'">
      <div class="brand">Vue Admin Pro</div>

      <AppMenu
        :menu="user.menuTree"
        :collapsed="app.isCollapsed"
        :icons="icons"
      />
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-header class="app-header" height="56px">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(m, idx) in breadcrumbs" :key="idx">
              {{ m }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-button size="small" @click="app.toggleCollapsed()">
          {{ app.isCollapsed ? "展开" : "收起" }}
        </el-button>
        <div class="header-right">
          <el-tag v-if="appStore.isLoading" type="info">Loading...</el-tag>
          <el-button type="primary" size="small" @click="onLogout"
            >退出</el-button
          >
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import AppMenu from "@/components/AppMenu.vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

// icons
import { House, User } from "@element-plus/icons-vue";

const app = useAppStore();

// ✅ 从路由表生成菜单
import { router as appRouter } from "@/router";
import { removeInjectedRoutes } from "@/router/dynamic";
import { buildMenuFromRoutes } from "@/router/menu";
// 全局 app 状态（含 loading）
const appStore = useAppStore();
// 用户权限状态
const user = useUserStore();

// ✅ Element Plus Icons：按需引入你路由 meta 里用到的 icon

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// 当前激活菜单
const activeMenu = computed(() => route.path);

// icon 映射表：meta.icon 用字符串，这里映射到真实组件
const icons: Record<string, any> = {
  House,
  User,
};

// 生成菜单（按权限过滤）
const menu = computed(() => {
  // 显式依赖当前路由与权限变化，确保动态路由注入后菜单会重新计算
  const routeKey = route.fullPath;
  const permKey = user.permissions.join(",");
  void routeKey;
  void permKey;
  return buildMenuFromRoutes(appRouter.getRoutes());
});

function onLogout() {
  // 清理登录态并返回登录页
  auth.logout();
  router.replace("/login");

  // 同时清空权限数据
  user.reset();
  // ✅ 移除动态路由（防止下个账号继承旧路由）
  removeInjectedRoutes(router);
}
const breadcrumbs = computed(() => {
  // route.matched 是从父到子的路由记录数组
  // 我们只取有 title 的部分作为面包屑
  return route.matched
    .map((r) => r.meta.title as string | undefined)
    .filter(Boolean) as string[];
});
</script>
<style scoped>
.app-shell {
  height: 100vh;
}

.app-aside {
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  transition: width 0.2s ease;
  overflow: hidden;
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 700;
  border-bottom: 1px solid var(--el-border-color);
}

.app-menu {
  border-right: none;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.app-main {
  background: var(--el-fill-color-lighter);
  padding: 16px;
}
</style>
