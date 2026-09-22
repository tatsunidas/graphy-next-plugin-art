/**
 * 署名配置の検査。canvas 無しで検証できるよう、位置計算は純関数に切り出してある。
 */
import { describe, expect, it } from "vitest";
import { placeSignature, SIGNATURE_POSITIONS, SIGNATURE_FONTS, FONT_BY_ID } from "../src/core/signature";

const base = { text: "T.K.", fontId: "serif" as const };

describe("placeSignature", () => {
  it("9 つの位置すべてが画像内に収まる", () => {
    for (const position of SIGNATURE_POSITIONS) {
      const p = placeSignature(800, 600, { ...base, position });
      expect(p.x, position).toBeGreaterThanOrEqual(0);
      expect(p.x, position).toBeLessThanOrEqual(800);
      expect(p.y, position).toBeGreaterThanOrEqual(0);
      expect(p.y, position).toBeLessThanOrEqual(600);
    }
  });

  it("左右・上下で align と baseline が切り替わる", () => {
    expect(placeSignature(800, 600, { ...base, position: "bottom-right" }).textAlign).toBe("right");
    expect(placeSignature(800, 600, { ...base, position: "bottom-left" }).textAlign).toBe("left");
    expect(placeSignature(800, 600, { ...base, position: "top-center" }).textAlign).toBe("center");
    expect(placeSignature(800, 600, { ...base, position: "top-left" }).textBaseline).toBe("top");
    expect(placeSignature(800, 600, { ...base, position: "middle-center" }).textBaseline).toBe("middle");
  });

  it("文字サイズは短辺に比例する（縦長でも横長でも破綻しない）", () => {
    const wide = placeSignature(1600, 400, { ...base, position: "bottom-right" });
    const tall = placeSignature(400, 1600, { ...base, position: "bottom-right" });
    expect(wide.fontPx).toBe(tall.fontPx);
  });

  it("極端に小さい画像でも読める下限を保つ", () => {
    expect(placeSignature(32, 32, { ...base, position: "bottom-right" }).fontPx).toBeGreaterThanOrEqual(8);
  });

  it("sizeRatio を上げると文字が大きくなる", () => {
    const small = placeSignature(800, 600, { ...base, position: "bottom-right", sizeRatio: 0.03 });
    const large = placeSignature(800, 600, { ...base, position: "bottom-right", sizeRatio: 0.08 });
    expect(large.fontPx).toBeGreaterThan(small.fontPx);
  });
});

describe("フォント一覧", () => {
  it("id が重複しない", () => {
    expect(FONT_BY_ID.size).toBe(SIGNATURE_FONTS.length);
  });

  it("すべてにフォールバック付きのスタックがある（単一フォント指定にしない）", () => {
    for (const f of SIGNATURE_FONTS) {
      expect(f.stack, f.id).toContain(",");
    }
  });
});
