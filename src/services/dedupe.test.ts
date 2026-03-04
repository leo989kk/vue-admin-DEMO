import { describe, expect, it } from "vitest";
import { dedupeRequest } from "./dedupe";

describe("dedupeRequest", () => {
  it("should reuse inflight promise", async () => {
    let count = 0;
    const fn = async () => {
      count++;
      await new Promise((r) => setTimeout(r, 50));
      return 123;
    };

    const p1 = dedupeRequest("k", fn);
    const p2 = dedupeRequest("k", fn);

    const [a, b] = await Promise.all([p1, p2]);

    expect(a).toBe(123);
    expect(b).toBe(123);
    expect(count).toBe(1);
  });
});
