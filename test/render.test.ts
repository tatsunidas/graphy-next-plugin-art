/**
 * 画面に見えているとおりの切り出しの検査。
 *
 * <p>ここが狂っても例外にはならず、**送られる絵の向きや範囲が違うだけ**なので
 * 目視でしか気付けない。しかも「左右反転しているが気付かない」類の間違いは、
 * 出来上がった作品を見ても分からない（元の断面を覚えていないため）。数値で固定する。
 */
import { describe, expect, it } from "vitest";
import { framingOutputSize, resampleFraming, type Framing } from "../src/core/render";

/**
 * 値が位置で決まるテスト画像。`v = y * 10 + x` なので、
 * **どの画素がどこから来たか**が値を見れば分かる。
 */
function ramp(cols: number, rows: number): Float32Array {
  const out = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) out[y * cols + x] = y * 10 + x;
  }
  return out;
}

/** 画像全体を覆うフレーミング（＝無操作の Fit）。 */
function whole(cols: number, rows: number, screenW = 100, screenH = 100): Framing {
  return {
    corners: [
      [-0.5, -0.5],
      [cols - 0.5, -0.5],
      [-0.5, rows - 0.5],
      [cols - 0.5, rows - 0.5],
    ],
    screenWidth: screenW,
    screenHeight: screenH,
  };
}

describe("resampleFraming", () => {
  it("画像全体・等倍なら元の画素がそのまま出る", () => {
    const src = ramp(4, 4);
    const out = resampleFraming(src, 4, 4, whole(4, 4), 4, 4, 0);
    expect(Array.from(out)).toEqual(Array.from(src));
  });

  it("左右反転すると列が逆順になる", () => {
    const src = ramp(4, 4);
    const f: Framing = {
      // 画面の左上が画像の右端。
      corners: [[3.5, -0.5], [-0.5, -0.5], [3.5, 3.5], [-0.5, 3.5]],
      screenWidth: 100,
      screenHeight: 100,
    };
    const out = resampleFraming(src, 4, 4, f, 4, 4, 0);
    // 最初の行は 3,2,1,0
    expect(Array.from(out.slice(0, 4))).toEqual([3, 2, 1, 0]);
  });

  it("上下反転すると行が逆順になる", () => {
    const src = ramp(4, 4);
    const f: Framing = {
      corners: [[-0.5, 3.5], [3.5, 3.5], [-0.5, -0.5], [3.5, -0.5]],
      screenWidth: 100,
      screenHeight: 100,
    };
    const out = resampleFraming(src, 4, 4, f, 4, 4, 0);
    // 最初の行は元の最終行 30,31,32,33
    expect(Array.from(out.slice(0, 4))).toEqual([30, 31, 32, 33]);
  });

  it("90 度回転すると行と列が入れ替わる", () => {
    const src = ramp(4, 4);
    // 画面の左上＝画像の左下、画面の右方向＝画像の上方向。
    const f: Framing = {
      corners: [[-0.5, 3.5], [-0.5, -0.5], [3.5, 3.5], [3.5, -0.5]],
      screenWidth: 100,
      screenHeight: 100,
    };
    const out = resampleFraming(src, 4, 4, f, 4, 4, 0);
    // 画面 1 行目は元の 1 列目を下から上へ: 30,20,10,0
    expect(Array.from(out.slice(0, 4))).toEqual([30, 20, 10, 0]);
  });

  it("🔴 拡大すると、その範囲だけが出る", () => {
    const src = ramp(8, 8);
    // 右下の 4x4 だけを見ている状態。
    const f: Framing = {
      corners: [[3.5, 3.5], [7.5, 3.5], [3.5, 7.5], [7.5, 7.5]],
      screenWidth: 100,
      screenHeight: 100,
    };
    const out = resampleFraming(src, 8, 8, f, 4, 4, 0);
    // 左上は元の (4,4) = 44
    expect(out[0]).toBeCloseTo(44, 5);
    // 右下は元の (7,7) = 77
    expect(out[15]).toBeCloseTo(77, 5);
  });

  it("範囲外は背景で埋める（拾えない画素を捏造しない）", () => {
    const src = ramp(4, 4);
    // 画像の外へはみ出したフレーミング。
    const f: Framing = {
      corners: [[-4.5, -4.5], [3.5, -4.5], [-4.5, 3.5], [3.5, 3.5]],
      screenWidth: 100,
      screenHeight: 100,
    };
    const out = resampleFraming(src, 4, 4, f, 8, 8, -1000);
    expect(out[0]).toBe(-1000); // 左上は画像の外
    expect(out[out.length - 1]).toBeCloseTo(33, 5); // 右下は画像の中
  });

  it("出力を細かくしても内挿で滑らかに増える（階段にしない）", () => {
    const src = ramp(4, 4);
    const out = resampleFraming(src, 4, 4, whole(4, 4), 8, 8, 0);
    // 単調増加であること（最近傍だと同じ値が並ぶ）。
    const row = Array.from(out.slice(0, 8));
    for (let i = 1; i < row.length; i++) expect(row[i]).toBeGreaterThan(row[i - 1]);
  });
});

describe("framingOutputSize", () => {
  it("画面の縦横比を保つ", () => {
    const f = whole(512, 512, 800, 600);
    const { width, height } = framingOutputSize(f, 1024);
    expect(width / height).toBeCloseTo(800 / 600, 2); // 整数に丸めるぶんの誤差は許す
  });

  it("長辺が maxEdge を超えない", () => {
    const f: Framing = {
      corners: [[-0.5, -0.5], [4095.5, -0.5], [-0.5, 4095.5], [4095.5, 4095.5]],
      screenWidth: 1000,
      screenHeight: 500,
    };
    const { width, height } = framingOutputSize(f, 1024);
    expect(Math.max(width, height)).toBeLessThanOrEqual(1024);
    expect(width / height).toBeCloseTo(2, 3);
  });

  it("縦長の画面でも長辺が maxEdge を超えない", () => {
    const f: Framing = {
      corners: [[-0.5, -0.5], [4095.5, -0.5], [-0.5, 4095.5], [4095.5, 4095.5]],
      screenWidth: 500,
      screenHeight: 1000,
    };
    const { width, height } = framingOutputSize(f, 1024);
    expect(Math.max(width, height)).toBeLessThanOrEqual(1024);
    expect(height).toBeCloseTo(1024, 0);
  });

  it("元画像より細かくはしない（無い情報を増やさない）", () => {
    // 64 画素ぶんしか見ていないのに 1024 は作らない。
    const f = whole(64, 64, 800, 800);
    const { width } = framingOutputSize(f, 1024);
    expect(width).toBeLessThanOrEqual(64);
  });
});
