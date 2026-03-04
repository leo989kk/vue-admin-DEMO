// src/stores/auth.ts
import { defineStore } from "pinia";

// 本地存储键名
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// 认证状态仓库：管理 access/refresh token
export const useAuthStore = defineStore("auth", {
  state: () => ({
    // 启动时从 localStorage 恢复 token
    accessToken: localStorage.getItem(ACCESS_KEY) || "",
    refreshToken: localStorage.getItem(REFRESH_KEY) || "",
  }),

  getters: {
    // 是否已登录
    isAuthed: (s) => Boolean(s.accessToken),
  },

  actions: {
    // 设置 token（登录/刷新都会用）
    setTokens(payload: { accessToken: string; refreshToken?: string }) {
      this.accessToken = payload.accessToken;
      localStorage.setItem(ACCESS_KEY, payload.accessToken);

      // refreshToken 可能登录时才下发，刷新时有些后端不会更新 refreshToken
      if (payload.refreshToken) {
        this.refreshToken = payload.refreshToken;
        localStorage.setItem(REFRESH_KEY, payload.refreshToken);
      }
    },

    logout() {
      // 清空内存与本地持久化 token
      this.accessToken = "";
      this.refreshToken = "";
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    },
  },
});
