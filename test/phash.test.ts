/**
 * 知覚ハッシュの検査。**再エンコードに耐え、別画像とは十分離れる**ことを確かめる。
 *
 * <p>Web 側の重複排除はこの性質だけに依存する（メタデータは剥がされる前提）。
 * ここが緩いと重複を通し、厳しすぎると別作品を重複扱いして投稿を弾く。
 */
import { describe, expect, it } from "vitest";
import { hammingDistance, pHash, toGrayResized, sha256Hex } from "../src/core/phash";

/** 決定的な疑似乱数（テストを揺らさない）。 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 実写・絵画に近い 1/f スペクトルの画像を作る。
 *
 * <p>**単一周波数の正弦波を使ってはいけない。** その場合、低周波 DCT 係数のほとんどが
 * ゼロ近傍に固まって中央値比較が純粋なノイズになり、pHash の性能とは無関係に
 * ハミング距離が暴れる（最初この generator で書いてしまい、距離が 0〜26 に散った）。
 * 自然画像の振幅は周波数に反比例して減衰するので、それを模す。
 */
function makeImage(w: number, h: number, seed: number): Uint8ClampedArray {
  const rnd = mulberry32(seed);
  const comps: { u: number; v: number; amp: number; ph: number }[] = [];
  for (let u = 0; u <= 6; u++) {
    for (let v = 0; v <= 6; v++) {
      if (u === 0 && v === 0) continue;
      comps.push({ u, v, amp: (rnd() * 2 - 1) / (u + v), ph: rnd() * Math.PI * 2 });
    }
  }
  const raw = new Float64Array(w * h);
  let min = Infinity;
  let max = -Infinity;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (const c of comps) {
        s += c.amp * Math.cos((x / w) * c.u * Math.PI + c.ph) * Math.cos((y / h) * c.v * Math.PI + c.ph);
      }
      raw[y * w + x] = s;
      if (s < min) min = s;
      if (s > max) max = s;
    }
  }
  const px = new Uint8ClampedArray(w * h * 4);
  const span = max - min || 1;
  for (let i = 0; i < w * h; i++) {
    const v = ((raw[i] - min) / span) * 255;
    const o = i * 4;
    px[o] = px[o + 1] = px[o + 2] = v;
    px[o + 3] = 255;
  }
  return px;
}

/** 弱い量子化＋ノイズ＝ JPEG 再圧縮のごく粗い代用。 */
function degrade(src: Uint8ClampedArray, seed: number): Uint8ClampedArray {
  const rnd = mulberry32(seed);
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const noise = (rnd() - 0.5) * 12;
    const v = Math.round((src[i] + noise) / 8) * 8;
    out[i] = out[i + 1] = out[i + 2] = v;
    out[i + 3] = 255;
  }
  return out;
}

describe("pHash", () => {
  it("16 桁の hex を返す（64 bit）", () => {
    const img = makeImage(64, 64, 1);
    expect(pHash(img, 64, 64)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("同じ画像なら同じ値（決定的）", () => {
    const img = makeImage(64, 64, 2);
    expect(pHash(img, 64, 64)).toBe(pHash(img, 64, 64));
  });

  it("再圧縮を模した劣化に耐える（距離 ≤ 5）", () => {
    for (let seed = 1; seed <= 12; seed++) {
      const img = makeImage(96, 96, seed);
      const d = hammingDistance(pHash(img, 96, 96), pHash(degrade(img, seed), 96, 96));
      expect(d, `seed=${seed} の劣化耐性`).toBeLessThanOrEqual(5);
    }
  });

  it("別の画像とは十分に離れる（距離 ≥ 20）", () => {
    // 劣化耐性(≤5)と十分に開いていること＝ Web 側が閾値を引ける、が確かめたい性質。
    for (let a = 1; a <= 6; a++) {
      for (let b = a + 1; b <= 6; b++) {
        const d = hammingDistance(pHash(makeImage(96, 96, a), 96, 96), pHash(makeImage(96, 96, b), 96, 96));
        expect(d, `seed ${a} と ${b}`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("縮小しても同じ絵と判定できる（リサイズ耐性）", () => {
    const big = makeImage(192, 192, 7);
    const small = makeImage(96, 96, 7); // 同じ生成式・同じ位相 ＝ 同じ絵の別解像度
    expect(hammingDistance(pHash(big, 192, 192), pHash(small, 96, 96))).toBeLessThanOrEqual(5);
  });

  it("全面一様な画像でも落ちない", () => {
    const flat = new Uint8ClampedArray(32 * 32 * 4).fill(255);
    expect(pHash(flat, 32, 32)).toMatch(/^[0-9a-f]{16}$/);
  });
});

/**
 * 🔴 PHP 実装との一致を固定する既知ベクトル。
 *
 * 投稿ギャラリー（vis-ionary.com の `inc/art-png.php`）は、アップロードされた画像から
 * 指紋を計算し直して、PNG に埋め込まれた値と突き合わせる。**両者がずれると正規の作品が
 * 一律に弾かれる。** どちらか片方だけを直せないよう、同じ入力に対する期待値をここに置く。
 *
 * 値を更新するときは、必ず PHP 側の同じベクトルも同時に更新すること
 * （vis-ionary-web の `tools/art-selftest.php`）。
 */
describe("PHP 実装との一致（既知ベクトル）", () => {
  const W = 100;
  const H = 73;

  function fixture(): Uint8ClampedArray {
    // 整数演算だけで作る。浮動小数だと言語間で最下位ビットが揺れうる。
    const px = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        px[o] = (x * 7 + y * 13) % 256;
        px[o + 1] = (x * 3 + y * 5) % 256;
        px[o + 2] = (x * 11 + y * 2) % 256;
        px[o + 3] = 255;
      }
    }
    return px;
  }

  it("SHA-256 が既知の値と一致する", async () => {
    expect(await sha256Hex(fixture())).toBe(
      "b60305f337a2acc56b2cd6b8e348e865b0d95ed2eba39e1c2f5ad44177e43ba7",
    );
  });

  it("pHash が既知の値と一致する", () => {
    expect(pHash(fixture(), W, H)).toBe("59424a17f952a5ab");
  });
});

describe("hammingDistance", () => {
  it("同一なら 0", () => {
    expect(hammingDistance("ffffffffffffffff", "ffffffffffffffff")).toBe(0);
  });

  it("全ビット反転なら 64", () => {
    expect(hammingDistance("0000000000000000", "ffffffffffffffff")).toBe(64);
  });

  it("長さが違えば比較を拒む（黙って 0 を返さない）", () => {
    expect(() => hammingDistance("ff", "ffff")).toThrow();
  });
});

describe("toGrayResized", () => {
  it("指定サイズの配列を返す", () => {
    expect(toGrayResized(makeImage(64, 32, 1), 64, 32, 16).length).toBe(256);
  });
});

describe("sha256Hex", () => {
  it("空バイト列の既知値を返す", async () => {
    expect(await sha256Hex(new Uint8Array(0))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("1 バイト違えば値が変わる", async () => {
    const a = await sha256Hex(new Uint8Array([1, 2, 3]));
    const b = await sha256Hex(new Uint8Array([1, 2, 4]));
    expect(a).not.toBe(b);
  });
});
