// src/directives/permission.ts
import { useUserStore } from "@/stores/user";
import type { Directive } from "vue";

/**
 * v-permission 用法：
 * <el-button v-permission="['user:create']">新建</el-button>
 *
 * 规则：如果用户不具备任意一个权限点，就把元素移除（最直接）
 */
export const permissionDirective: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const user = useUserStore();
    const needPerms = binding.value ?? [];

    if (needPerms.length === 0) return;

    const ok = user.hasAnyPermission(needPerms);
    if (!ok) {
      // 直接从 DOM 移除（最简单的权限控制）
      el.parentNode?.removeChild(el);
    }
  },
};
