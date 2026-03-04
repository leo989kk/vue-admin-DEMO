// src/services/refreshLock.ts
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/api";
import type { AxiosInstance } from "axios";
import { unwrapData } from "./apiClient";

/**
 * 刷新锁：保证同一时刻只会发出 1 次 refresh 请求
 * 其他并发遇到 401 的请求，等待这一次 refresh 的结果，然后重放。
 */
let refreshingPromise: Promise<string> | null = null;

// 刷新接口返回结构
type RefreshResp = { accessToken: string; refreshToken?: string };

export async function refreshAccessToken(http: AxiosInstance): Promise<string> {
  const auth = useAuthStore();

  // 没 refreshToken，无法刷新
  if (!auth.refreshToken) {
    throw new Error("No refresh token");
  }

  // 如果已经在刷新，就直接复用同一个 promise
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    // 使用 refresh token 换取新 access token
    const resp = await http.post<ApiResponse<RefreshResp>>("/auth/refresh", {
      refreshToken: auth.refreshToken,
    });

    const data = unwrapData(resp.data);

    // ✅ 更新 token
    auth.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken, // 可能没有
    });

    return data.accessToken;
  })();

  try {
    return await refreshingPromise;
  } finally {
    // ✅ 无论成功失败，都要释放锁
    refreshingPromise = null;
  }
}
