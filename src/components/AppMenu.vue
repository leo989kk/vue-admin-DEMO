<template>
  <el-menu
    :default-active="activePath"
    :collapse="collapsed"
    router
    class="app-menu"
  >
    <template v-for="node in visibleMenu" :key="fullPath(node.path)">
      <!-- 有 children：渲染 SubMenu -->
      <el-sub-menu
        v-if="hasVisibleChildren(node)"
        :index="fullPath(node.path)"
      >
        <template #title>
          <el-icon v-if="node.icon">
            <component :is="icons[node.icon]" />
          </el-icon>
          <span>{{ node.title }}</span>
        </template>

        <!-- 递归渲染 children -->
        <app-menu-item
          :nodes="getVisibleChildren(node)"
          :base="fullPath(node.path)"
          :icons="icons"
        />
      </el-sub-menu>

      <!-- 无 children：渲染 MenuItem -->
      <el-menu-item v-else :index="fullPath(node.path)">
        <el-icon v-if="node.icon">
          <component :is="icons[node.icon]" />
        </el-icon>
        <span>{{ node.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import type { MenuNode } from "@/types/menu";
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppMenuItem from "./AppMenuItem.vue";

const props = defineProps<{
  menu: MenuNode[];
  collapsed: boolean;
  icons: Record<string, any>;
}>();

const route = useRoute();

/**
 * 当前激活：用 route.path
 */
const activePath = computed(() => route.path);

/**
 * 过滤隐藏项（hidden=true 不显示）
 * 说明：权限过滤一般在后端或 loadMenu 时已处理，这里只处理 hidden
 */
const visibleMenu = computed(() =>
  (props.menu || []).filter((n) => !n.hidden && n.title),
);

function getVisibleChildren(node: MenuNode): MenuNode[] {
  return (node.children || []).filter((c) => !c.hidden && c.title);
}

function hasVisibleChildren(node: MenuNode): boolean {
  return getVisibleChildren(node).length > 0;
}

/**
 * 把 menu node 的 path 变成完整路径：
 * - 顶层 "" => "/"
 * - 顶层 "users" => "/users"
 */
function fullPath(p: string) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}
</script>

<style scoped>
.app-menu {
  border-right: none;
}
</style>
