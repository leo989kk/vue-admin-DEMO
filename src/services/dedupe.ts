// src/services/dedupe.ts
import type { AxiosRequestConfig } from "axios";

// 记录正在进行中的同类请求
const inflight = new Map<string, Promise<any>>();

// 根据请求配置生成稳定 key（method + url + params）
function buildKey(config: AxiosRequestConfig) {
  const url = config.url || "";
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.method || "get"}:${url}?${params}`;
}

export function dedupeRequest<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  // 若已有同 key 请求在进行，直接复用 Promise
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  // 请求结束后删除缓存，避免内存泄漏
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export { buildKey };
