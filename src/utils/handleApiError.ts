// src/utils/handleApiError.ts
import type { ApiError } from "@/types/api";
import { toastOnce } from "./messgae";

// 统一业务错误兜底：提取 message 并弹出节流提示
export function handleApiError(e: unknown, key = "biz-error") {
  const err = e as ApiError | any;
  const msg = err?.message || "请求失败";
  toastOnce(key, msg, "error");
}
