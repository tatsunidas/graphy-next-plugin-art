/**
 * PNG へのメタデータ埋め込みの往復検査。
 *
 * <p>「書けた」だけでは足りない。**埋め込んだ PNG が PNG のまま**で、
 * 他のデコーダが開けることまで確かめる（チャンク長や CRC を間違えると、
 * 自前の読み出しだけは通るのに画像ビューアが開けない、という壊れ方をする）。
 */
import { describe, expect, it } from "vitest";
import { crc32, embedGraphyArt, readGraphyArt, GRAPHY_ART_SPEC } from "../src/core/pngMeta";

/** 1x1 の最小 PNG（透明）。base64 は標準的なテストフィクスチャ。 */
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function tinyPng(): Uint8Array {
  return Uint8Array.from(Buffer.from(TINY_PNG_B64, "base64"));
}

const META = { spec: GRAPHY_ART_SPEC, model: "gemini-3.1-flash-image", pHash: "a1b2c3d4e5f6a7b8" };

describe("crc32", () => {
  it("PNG/zip と同じ多項式の既知値を返す", () => {
    // "IEND" の CRC は PNG 仕様上いつも 0xAE426082。
    expect(crc32(new TextEncoder().encode("IEND"))).toBe(0xae426082);
  });
});

describe("embedGraphyArt / readGraphyArt", () => {
  it("書いた JSON をそのまま読み戻せる", () => {
    const out = embedGraphyArt(tinyPng(), META);
    expect(readGraphyArt(out)).toEqual(META);
  });

  it("PNG シグネチャを壊さない", () => {
    const out = embedGraphyArt(tinyPng(), META);
    expect(Array.from(out.subarray(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });

  it("全チャンクの CRC が正しい（他のデコーダでも開ける）", () => {
    const out = embedGraphyArt(tinyPng(), META);
    let at = 8;
    let checked = 0;
    while (at + 8 <= out.length) {
      const length = ((out[at] << 24) | (out[at + 1] << 16) | (out[at + 2] << 8) | out[at + 3]) >>> 0;
      const type = String.fromCharCode(out[at + 4], out[at + 5], out[at + 6], out[at + 7]);
      const stored =
        ((out[at + 8 + length] << 24) |
          (out[at + 9 + length] << 16) |
          (out[at + 10 + length] << 8) |
          out[at + 11 + length]) >>>
        0;
      expect(crc32(out.subarray(at + 4, at + 8 + length)), `${type} の CRC`).toBe(stored);
      checked++;
      at += 12 + length;
      if (type === "IEND") break;
    }
    expect(checked).toBeGreaterThanOrEqual(3); // IHDR, iTXt, IDAT, IEND
  });

  it("iTXt は IHDR の直後・IDAT より前に入る", () => {
    const out = embedGraphyArt(tinyPng(), META);
    const text = Buffer.from(out).toString("latin1");
    expect(text.indexOf("IHDR")).toBeLessThan(text.indexOf("iTXt"));
    expect(text.indexOf("iTXt")).toBeLessThan(text.indexOf("IDAT"));
  });

  it("元の PNG のバイト列は一切書き換えない（チャンクの挿入だけ）", () => {
    const src = tinyPng();
    const out = embedGraphyArt(src, META);
    const removed = new Uint8Array(src.length);
    // 挿入分を取り除くと元に戻ること。
    const inserted = out.length - src.length;
    const ihdrEnd = 8 + 12 + 13; // signature + IHDR(length13)
    removed.set(out.subarray(0, ihdrEnd), 0);
    removed.set(out.subarray(ihdrEnd + inserted), ihdrEnd);
    expect(Array.from(removed)).toEqual(Array.from(src));
  });

  it("メタデータが無い PNG では null", () => {
    expect(readGraphyArt(tinyPng())).toBeNull();
  });

  it("PNG でないものは null（読み出しでは投げない）", () => {
    expect(readGraphyArt(new Uint8Array([1, 2, 3, 4]))).toBeNull();
  });

  it("PNG でないものへの書き込みは明示的に失敗する", () => {
    expect(() => embedGraphyArt(new Uint8Array([1, 2, 3]), META)).toThrow();
  });

  it("日本語を含む JSON も往復できる（UTF-8）", () => {
    const meta = { ...META, note: "葛飾北斎の作風による翻案" };
    expect(readGraphyArt(embedGraphyArt(tinyPng(), meta))).toEqual(meta);
  });
});
