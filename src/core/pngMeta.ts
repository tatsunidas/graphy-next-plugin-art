/**
 * PNG の `iTXt` チャンクに生成情報（JSON）を埋め込む／読み戻す。
 *
 * <p>本体にも PNG メタデータの書き出しは無く、`canvas.toBlob` は一切の付帯情報を落とす。
 * よって自前でチャンクを組む。手本は本体の `frontend/src/viewer/tiffFloat32.ts`
 * （コンテナを手書きするときの流儀）で、CRC32 の多項式は `zipStore.ts#crc32` と同じ。
 *
 * <p>**DOM に依存しない**ので node 上のテストで往復を検証できる。
 *
 * <h3>限界を承知しておくこと</h3>
 * メタデータは再エンコード・スクリーンショット・SNS へのアップロードで簡単に消える。
 * したがって「GRAPHY 製である」判定をこれだけに頼らない。Web 側では
 *   ① このメタデータ  ② サーバ側で再計算した pHash  ③ 生画素の SHA-256 完全一致
 * の三層で見る。改ざん耐性は無い（署名方式は採用していない）。
 */

/** 埋め込みに使う iTXt のキーワード。 */
export const GRAPHY_ART_KEYWORD = "graphy-art";
/** メタデータの版。読み手が形の違いを判別できるようにする。 */
export const GRAPHY_ART_SPEC = "graphy-art/1";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

function readU32(bytes: Uint8Array, at: number): number {
  return ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
}

function writeU32(view: Uint8Array, at: number, value: number): void {
  view[at] = (value >>> 24) & 0xff;
  view[at + 1] = (value >>> 16) & 0xff;
  view[at + 2] = (value >>> 8) & 0xff;
  view[at + 3] = value & 0xff;
}

/** 1 チャンクぶんのバイト列（length + type + data + crc）を組む。 */
function buildChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) typeBytes[i] = type.charCodeAt(i);
  const chunk = new Uint8Array(12 + data.length);
  writeU32(chunk, 0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  const forCrc = new Uint8Array(4 + data.length);
  forCrc.set(typeBytes, 0);
  forCrc.set(data, 4);
  writeU32(chunk, 8 + data.length, crc32(forCrc));
  return chunk;
}

/**
 * iTXt のデータ部を組む（非圧縮）。
 * 構成: keyword \0 compressionFlag compressionMethod languageTag \0 translatedKeyword \0 text(UTF-8)
 */
function buildITxtData(keyword: string, text: string): Uint8Array {
  const kw = new TextEncoder().encode(keyword);
  const body = new TextEncoder().encode(text);
  // keyword \0 + flag + method + langTag \0 + translated \0
  const data = new Uint8Array(kw.length + 1 + 1 + 1 + 1 + 1 + body.length);
  let o = 0;
  data.set(kw, o);
  o += kw.length;
  data[o++] = 0; // keyword 終端
  data[o++] = 0; // compression flag: 非圧縮
  data[o++] = 0; // compression method
  data[o++] = 0; // language tag: 空
  data[o++] = 0; // translated keyword: 空
  data.set(body, o);
  return data;
}

/** チャンクを順に走査する。 */
function* chunks(bytes: Uint8Array): Generator<{ type: string; start: number; dataStart: number; length: number }> {
  let at = 8;
  while (at + 8 <= bytes.length) {
    const length = readU32(bytes, at);
    const type = String.fromCharCode(bytes[at + 4], bytes[at + 5], bytes[at + 6], bytes[at + 7]);
    yield { type, start: at, dataStart: at + 8, length };
    at += 12 + length;
    if (type === "IEND") return;
  }
}

/**
 * PNG に `graphy-art` の JSON を埋め込む。IHDR の直後へ差し込む（IDAT より前であれば妥当）。
 *
 * @throws PNG でない場合／IHDR が見つからない場合
 */
export function embedGraphyArt(png: Uint8Array, metadata: unknown): Uint8Array {
  if (!isPng(png)) throw new Error("PNG ではありません");
  const json = JSON.stringify(metadata);
  const chunk = buildChunk("iTXt", buildITxtData(GRAPHY_ART_KEYWORD, json));

  let insertAt = -1;
  for (const c of chunks(png)) {
    if (c.type === "IHDR") {
      insertAt = c.start + 12 + c.length;
      break;
    }
  }
  if (insertAt < 0) throw new Error("IHDR が見つかりません");

  const out = new Uint8Array(png.length + chunk.length);
  out.set(png.subarray(0, insertAt), 0);
  out.set(chunk, insertAt);
  out.set(png.subarray(insertAt), insertAt + chunk.length);
  return out;
}

/**
 * 埋め込んだ JSON を読み戻す。見つからなければ null。
 * **壊れた JSON でも例外にしない**（他アプリが書いた同名チャンクかもしれない）。
 */
export function readGraphyArt(png: Uint8Array): unknown | null {
  if (!isPng(png)) return null;
  const decoder = new TextDecoder();
  for (const c of chunks(png)) {
    if (c.type !== "iTXt") continue;
    const data = png.subarray(c.dataStart, c.dataStart + c.length);
    const nul = data.indexOf(0);
    if (nul < 0) continue;
    if (decoder.decode(data.subarray(0, nul)) !== GRAPHY_ART_KEYWORD) continue;
    // keyword \0 flag method langTag \0 translated \0 の順に読み飛ばす
    let o = nul + 1;
    o += 2; // flag, method
    const langEnd = data.indexOf(0, o);
    if (langEnd < 0) continue;
    o = langEnd + 1;
    const transEnd = data.indexOf(0, o);
    if (transEnd < 0) continue;
    o = transEnd + 1;
    try {
      return JSON.parse(decoder.decode(data.subarray(o)));
    } catch {
      return null;
    }
  }
  return null;
}
