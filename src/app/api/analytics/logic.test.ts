import { describe, expect, it } from "vitest";
import { metricOrUnavailable } from "./logic";

// G841 NUMBERS-TRUTH: a failed analytics query is "unavailable" (null), never a disguised 0.
describe("metricOrUnavailable", () => {
  it("a failed query (null rows) is unavailable, not 0", () => {
    expect(metricOrUnavailable(null, "count")).toBeNull();
  });
  it("a real zero stays 0", () => {
    expect(metricOrUnavailable([{ count: "0" }], "count")).toBe(0);
  });
  it("reads the value", () => {
    expect(metricOrUnavailable([{ retained: "12" }], "retained")).toBe(12);
  });
});
