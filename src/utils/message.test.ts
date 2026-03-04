import { describe, expect, it, vi } from "vitest";

// mock element-plus ElMessage
vi.mock("element-plus", () => ({
  ElMessage: vi.fn(),
}));

import { ElMessage } from "element-plus";
import { toastOnce } from "./messgae";

describe("toastOnce", () => {
  it("should only show once within cooldown", () => {
    toastOnce("k1", "hello", "error", 2000);
    toastOnce("k1", "hello", "error", 2000);
    expect(ElMessage).toHaveBeenCalledTimes(1);
  });
});
