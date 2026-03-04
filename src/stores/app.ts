// src/stores/app.ts
import { defineStore } from "pinia";

// 全局 UI 状态：用于控制请求 loading
export const useAppStore = defineStore("app", {
  state: () => ({
    loadingCount: 0, // 计数器：>0 表示有请求进行中
    isCollapsed: false,
  }),
  getters: {
    // 是否存在正在进行中的请求
    isLoading: (s) => s.loadingCount > 0,
  },
  actions: {
    // 请求开始：计数 +1
    startLoading() {
      this.loadingCount++;
    },
    // 请求结束：计数 -1（最小为 0）
    stopLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
    },
    // 强制重置 loading 状态
    resetLoading() {
      this.loadingCount = 0;
    },

    toggleCollapsed() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
});
