import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UpgradeModal from "./UpgradeModal";

describe("UpgradeModal usage count", () => {
  it("renders no number when the count has not loaded", () => {
    const html = renderToStaticMarkup(createElement(UpgradeModal, { onClose: () => {} }));
    expect(html).not.toMatch(/written \d+ pieces/);
    expect(html).not.toMatch(/>\d+</);
    expect(html).toContain("reached your monthly limit");
  });
  it("renders the real count when provided", () => {
    const html = renderToStaticMarkup(createElement(UpgradeModal, { used: 20, onClose: () => {} }));
    expect(html).toContain("written 20 pieces");
  });
});
