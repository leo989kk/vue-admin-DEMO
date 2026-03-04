// src/services/apiClient.ts
import { router } from "@/router";
import { removeInjectedRoutes } from "@/router/dynamic";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import type { ApiError, ApiResponse } from "@/types/api";
import { toastOnce } from "@/utils/messgae";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./refreshLock";

// API 基础地址（优先读取环境变量）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * 业务请求 client：正常 API 走这里
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * 刷新 token 专用 client：只用于 /auth/refresh
 * 注意：不挂 401 自动刷新逻辑，避免死循环
 */
const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// --- 业务解包 ---
export function unwrapData<T>(res: ApiResponse<T>): T {
  if (!res.success)
    throw { message: res.msg || "请求失败", code: res.code } as ApiError;
  if (res.code !== "1")
    throw { message: res.msg || "请求失败", code: res.code } as ApiError;
  return res.data;
}

// --- 请求拦截：带 token + loading ---
apiClient.interceptors.request.use(
  (config) => {
    const auth = useAuthStore();
    const app = useAppStore();
    // 任意请求发出前开启全局 loading
    app.startLoading();

    config.headers = config.headers ?? {};

    // ✅ 带 accessToken
    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// --- 响应拦截：关闭 loading + 统一错误 + 401 刷新锁重放 ---
apiClient.interceptors.response.use(
  (resp) => {
    const app = useAppStore();
    // 成功响应时关闭全局 loading
    app.stopLoading();
    return resp;
  },
  async (error: AxiosError) => {
    const app = useAppStore();
    // 失败响应时同样关闭全局 loading
    app.stopLoading();

    const status = error.response?.status;
    const auth = useAuthStore();

    // 取到原请求配置（用于重放）
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // ====== 401：尝试刷新 + 重放 ======
    if (status === 401 && original && !original._retry) {
      original._retry = true; // ✅ 防止无限重试

      try {
        // 1) 刷新 accessToken（并发锁）
        const newAccess = await refreshAccessToken(refreshClient);

        // 2) 给原请求补新 token
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;

        // 3) 重放原请求
        return apiClient(original);
      } catch {
        // 刷新失败：强制登出
        auth.logout();
        // ✅ 移除动态路由（防止下个账号继承旧路由）
        removeInjectedRoutes(router);
        const redirect = router.currentRoute.value.fullPath;
        await router.replace({ path: "/login", query: { redirect } });
        toastOnce("auth-expired", "登录已过期，请重新登录", "warning");
        return Promise.reject<ApiError>({
          message: "Unauthorized",
          status: 401,
        });
      }
    }

    // ====== 403：跳 403 ======
    if (status === 403) {
      await router.replace("/403");
      toastOnce("forbidden", "无权限访问", "error");
      return Promise.reject<ApiError>({ message: "Forbidden", status: 403 });
    }
    if (error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    // ====== 其它错误 ======
    const msg = error.message || "网络错误";
    // 使用节流消息避免短时间重复提示
    toastOnce("network-error", msg, "error");
    return Promise.reject<ApiError>({ message: msg, status });
  },
);
