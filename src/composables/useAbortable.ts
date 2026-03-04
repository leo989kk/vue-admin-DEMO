// 组合式函数：统一管理单个可中断请求控制器
import { onBeforeUnmount } from "vue";

export function useAbortable() {
  // 保存当前生效的 AbortController
  let controller: AbortController | null = null;

  // 创建新 signal 前，先取消上一次请求
  function newSignal() {
    controller?.abort();
    controller = new AbortController();
    return controller.signal;
  }
  // 手动中止当前请求
  function abort() {
    controller?.abort();
    controller = null;
  }
  // 组件卸载时自动中止请求
  onBeforeUnmount(abort);
  return {
    newSignal,
    abort,
  };
}
