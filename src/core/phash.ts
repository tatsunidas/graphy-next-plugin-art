/**
 * 知覚ハッシュ（pHash）と生画素の SHA-256。**重複登録を弾くための指紋**。
 *
 * <h3>なぜ 2 種類あるのか</h3>
 *   - `sha256`  … 生 RGBA のバイト列に対する完全一致。同一ファイルの再投稿を確実に弾く。
 *   - `pHash`   … 32x32 の DCT 低周波から作る 64 bit。**再エンコード・リサイズ・軽い圧縮に耐える**ので、
 *                 メタデータを剥がされ JPEG 化された画像でも「同じ絵」と判定できる。
 *
 * <p>Web 側はアップロードされた画素から pHash を**再計算して**突き合わせる。
 * 埋め込まれた値を信用して比較すると、値を書き換えるだけで重複判定を回避できてしまう。
 *
 * <h3>ハッシュの対象は「生画素」であってファイルではない</h3>
 * ファイル全体のハッシュを撮ると、メタデータを埋め込んだ瞬間に値が変わり、
 * メタデータ内に書いた自分自身のハッシュと食い違う。だから RGBA バッファを対象にする。
 */

/**
 * 生 RGBA バッファの SHA-256（16 進小文字）。
 *
 * <p>`Uint8ClampedArray`（canvas の `getImageData().data` の型）もそのまま受ける。
 * 呼び出し側で詰め替えさせると、ビューのオフセットを取り違えて別物をハッシュしかねない。
 */
export async function sha256Hex(bytes: Uint8Array | Uint8ClampedArray): Promise<string> {
  // 部分ビューかもしれないので、見えている範囲だけを新しいバッファへ写す。
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** BT.601 の輝度。カラーを 1 チャンネルに落とす。 */
function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * RGBA を size×size のグレースケールへ縮小する。**ボックス平均で潰す。**
 *
 * <p>最近傍で間引くと、1 画素ごとのノイズがそのまま縮小後の値になる。JPEG 再圧縮や
 * リサイズが生む劣化はまさにその高周波ノイズなので、間引き実装は「再エンコード耐性」を
 * 失う（実測で同一画像の劣化版とのハミング距離が 0〜26 まで暴れた）。
 * 平均を取れば高周波が落ち、pHash が見る低周波だけが残る。
 */
export function toGrayResized(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  size: number,
): Float64Array {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor((y * height) / size);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / size));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor((x * width) / size);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / size));
      let sum = 0;
      let n = 0;
      for (let sy = y0; sy < y1 && sy < height; sy++) {
        for (let sx = x0; sx < x1 && sx < width; sx++) {
          const o = (sy * width + sx) * 4;
          sum += luma(rgba[o], rgba[o + 1], rgba[o + 2]);
          n++;
        }
      }
      out[y * size + x] = n > 0 ? sum / n : 0;
    }
  }
  return out;
}

/** 2 次元 DCT-II（size は 32 程度なので素朴な実装で足りる）。 */
function dct2(input: Float64Array, size: number): Float64Array {
  // 分離可能なので行 → 列の 2 段に分ける（O(n^3) で、32 なら一瞬）。
  const cos = new Float64Array(size * size);
  for (let u = 0; u < size; u++) {
    for (let x = 0; x < size; x++) {
      cos[u * size + x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size));
    }
  }
  const tmp = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let u = 0; u < size; u++) {
      let s = 0;
      for (let x = 0; x < size; x++) s += input[y * size + x] * cos[u * size + x];
      tmp[y * size + u] = s;
    }
  }
  const out = new Float64Array(size * size);
  for (let u = 0; u < size; u++) {
    for (let v = 0; v < size; v++) {
      let s = 0;
      for (let y = 0; y < size; y++) s += tmp[y * size + u] * cos[v * size + y];
      out[v * size + u] = s;
    }
  }
  return out;
}

/**
 * 64 bit の pHash を 16 桁の 16 進で返す。
 *
 * <p>32x32 の DCT のうち左上 8x8（＝低周波）を使い、**DC 成分を除いた**中央値と
 * 比較してビットを立てる。DC を含めると平均輝度だけで全ビットが傾き、
 * 明るさ調整に弱くなる。
 */
export function pHash(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): string {
  const SIZE = 32;
  const LOW = 8;
  const gray = toGrayResized(rgba, width, height, SIZE);
  const freq = dct2(gray, SIZE);

  const vals: number[] = [];
  for (let v = 0; v < LOW; v++) {
    for (let u = 0; u < LOW; u++) {
      if (u === 0 && v === 0) continue; // DC を除く
      vals.push(freq[v * SIZE + u]);
    }
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // 63 個の比較結果 ＋ 先頭 1 bit（DC の位置。常に 0）で 64 bit に揃える。
  let hex = "";
  let bits = 0;
  let acc = 0;
  const push = (bit: number): void => {
    acc = (acc << 1) | bit;
    bits++;
    if (bits === 4) {
      hex += acc.toString(16);
      acc = 0;
      bits = 0;
    }
  };
  push(0);
  for (const v of vals) push(v > median ? 1 : 0);
  return hex;
}

/** 2 つの pHash のハミング距離。小さいほど似ている（0 なら同一とみなせる）。 */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) throw new Error("長さの違うハッシュは比較できません");
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}
