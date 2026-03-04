<template>
  <template v-for="node in visibleNodes" :key="join(base, node.path)">
    <el-sub-menu v-if="hasVisibleChildren(node)" :index="join(base, node.path)">
      <template #title>
        <el-icon v-if="node.icon">
          <component :is="icons[node.icon]" />
        </el-icon>
        <span>{{ node.title }}</span>
      </template>

      <app-menu-item
        :nodes="getVisibleChildren(node)"
        :base="join(base, node.path)"
        :icons="icons"
      />
    </el-sub-menu>

    <el-menu-item v-else :index="join(base, node.path)">
      <el-icon v-if="node.icon">
        <component :is="icons[node.icon]" />
      </el-icon>
      <span>{{ node.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { MenuNode } from "@/types/menu";
import { computed } from "vue";

const props = defineProps<{
  nodes: MenuNode[];
  base: string; // 父级路径，比如 "/users"
  icons: Record<string, any>;
}>();

const visibleNodes = computed(() =>
  (props.nodes || []).filter((n) => !n.hidden && n.title),
);

function getVisibleChildren(node: MenuNode): MenuNode[] {
  return (node.children || []).filter((c) => !c.hidden && c.title);
}

function hasVisibleChildren(node: MenuNode): boolean {
  return getVisibleChildren(node).length > 0;
}

function join(base: string, child: string) {
  // base 以 "/" 开头
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!child) return b;
  if (child.startsWith("/")) return child;
  return `${b}/${child}`;
}
</script>
