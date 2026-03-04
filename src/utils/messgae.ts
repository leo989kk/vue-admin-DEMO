// src/utils/message.ts
import { ElMessage } from "element-plus";

/**
 * 简单节流：相同 key 的消息在 cooldown 时间内只弹一次
 */
const lastShownAt = new Map<string, number>();

export function toastOnce(
  key: string,
  message: string,
  type: "success" | "warning" | "info" | "error" = "error",
  cooldownMs = 2000,
) {
  // 当前时间戳
  const now = Date.now();
  const last = lastShownAt.get(key) || 0;

  // 仍在冷却窗口内就不重复提示
  if (now - last < cooldownMs) return;

  // 记录本次提示时间并触发消息弹窗
  lastShownAt.set(key, now);
  ElMessage({ message, type });
}
