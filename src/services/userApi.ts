// src/services/userApi.ts
import type { ApiResponse } from "@/types/api";
import { apiClient, unwrapData } from "./apiClient";
import { dedupeRequest } from "./dedupe";

// 用户实体类型
export type User = {
  id: number;
  name: string;
};

// 获取用户列表：支持取消请求 + 并发去重
export async function getUsers(signal?: AbortSignal) {
  return dedupeRequest("GET:/users", async () => {
    // 传入 AbortSignal，组件卸载时可中断请求
    const resp = await apiClient.get<ApiResponse<User[]>>("/users", { signal });
    return unwrapData(resp.data);
  });
}
