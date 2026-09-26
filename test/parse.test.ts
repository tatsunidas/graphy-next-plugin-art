/**
 * Gemini レスポンス解析の検査。キー名の揺れと「画像が返らない」場合の扱いが要点。
 */
import { describe, expect, it } from "vitest";
import { extractNote, parseGeneration, readBlockReason, readGeneration } from "../src/core/parse";

const IMAGE_B64 = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString("base64");

function response(parts: unknown[], extra: Record<string, unknown> = {}): unknown {
  return { candidates: [{ content: { parts }, ...extra }] };
}

describe("parseGeneration", () => {
  it("camelCase の inlineData から画像を取り出す", () => {
    const r = parseGeneration(response([{ inlineData: { mimeType: "image/png", data: IMAGE_B64 } }]));
    expect(r.image).not.toBeNull();
    expect(Array.from(r.image!)).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(r.imageMimeType).toBe("image/png");
  });

  it("snake_case の inline_data からも取り出す（表記の揺れを決め打ちにしない）", () => {
    const r = parseGeneration(response([{ inline_data: { mime_type: "image/jpeg", data: IMAGE_B64 } }]));
    expect(r.image).not.toBeNull();
    expect(r.imageMimeType).toBe("image/jpeg");
  });

  it("テキストと画像が混在していても両方取れる", () => {
    const r = parseGeneration(
      response([
        { text: '```json\n{"title":"青のゆらぎ","appreciation":"静かな構図"}\n```' },
        { inlineData: { mimeType: "image/png", data: IMAGE_B64 } },
      ]),
    );
    expect(r.image).not.toBeNull();
    expect(r.note).toEqual({ title: "青のゆらぎ", appreciation: "静かな構図" });
  });

  it("画像が無くてもテキストは活きる", () => {
    const r = parseGeneration(response([{ text: "説明のみ" }]));
    expect(r.image).toBeNull();
    expect(r.text).toBe("説明のみ");
  });

  it("空・壊れたレスポンスでも例外にしない", () => {
    expect(parseGeneration(null).image).toBeNull();
    expect(parseGeneration({}).image).toBeNull();
    expect(parseGeneration({ candidates: [] }).image).toBeNull();
    expect(parseGeneration({ candidates: [{ content: {} }] }).text).toBe("");
  });

  it("base64 が壊れていても、テキストは失わない", () => {
    const r = parseGeneration(
      response([{ text: "説明" }, { inlineData: { mimeType: "image/png", data: "!!!not-base64!!!" } }]),
    );
    expect(r.text).toBe("説明");
  });
});

describe("extractNote", () => {
  it("```json ブロックから取り出す", () => {
    expect(extractNote('前置き\n```json\n{"title":"a","appreciation":"b"}\n```\n後置き')).toEqual({
      title: "a",
      appreciation: "b",
    });
  });

  it("コードフェンスが無い素の JSON でも取り出す", () => {
    expect(extractNote('{"title":"a","appreciation":"b"}')).toEqual({ title: "a", appreciation: "b" });
  });

  // モデルは片方だけ返すことがある。半分でも無いよりはよい。
  it("片方のキーしか無くても拾う", () => {
    expect(extractNote('{"appreciation":"b"}')).toEqual({ title: "", appreciation: "b" });
    expect(extractNote('{"title":"a"}')).toEqual({ title: "a", appreciation: "" });
  });

  // 投稿フォームの上限を超えていても、ここでは切らない。
  // 文の途中で切れた文章を貼らせるより、UI に長さを出して直してもらう。
  it("上限を超える長さでも切り詰めない", () => {
    const long = "あ".repeat(900);
    expect(extractNote(JSON.stringify({ title: "a", appreciation: long }))?.appreciation).toHaveLength(900);
  });

  it("JSON が無ければ null（例外にしない）", () => {
    expect(extractNote("ただの文章です")).toBeNull();
    expect(extractNote("")).toBeNull();
  });

  it("壊れた JSON でも null で済ませる", () => {
    expect(extractNote("```json\n{title:\n```")).toBeNull();
  });
});

describe("readBlockReason", () => {
  it("promptFeedback.blockReason を拾う", () => {
    expect(readBlockReason({ promptFeedback: { blockReason: "SAFETY" } })).toBe("SAFETY");
  });

  it("finishReason が STOP 以外なら拾う", () => {
    expect(readBlockReason(response([], { finishReason: "IMAGE_SAFETY" }))).toBe("IMAGE_SAFETY");
  });

  it("正常終了なら null", () => {
    expect(readBlockReason(response([{ text: "ok" }], { finishReason: "STOP" }))).toBeNull();
  });
});

// ── 本体からの結果の読み方（新旧どちらの本体でも動くこと） ────────────────────
//
// 🔑 0.3.0 の本体は提供元の生レスポンス（data）しか返さない。0.3.1 以降は
// image / text を提供元非依存の形で返す。このプラグインは `>=0.3.0` を名乗るので、
// **両方を受けられないと古い本体で動かなくなる**（しかも例外は出ず、画像か文章が黙って落ちる）。
describe("readGeneration — 正規化済みと生レスポンスの両対応", () => {
  const IMG = new Uint8Array([9, 8, 7]);

  it("本体が畳んでくれているならそれを使う（0.3.1 以降）", () => {
    const r = readGeneration({
      image: { bytes: IMG, mimeType: "image/png" },
      text: '```json\n{"title":"題","appreciation":"文"}\n```',
    });
    expect(r.image).toBe(IMG);
    expect(r.imageMimeType).toBe("image/png");
    expect(r.note).toEqual({ title: "題", appreciation: "文" });
  });

  it("🔴 古い本体（生レスポンスだけ）でも読める", () => {
    const r = readGeneration({
      data: {
        candidates: [
          {
            content: {
              parts: [
                { text: '{"title":"旧","appreciation":"旧文"}' },
                { inlineData: { mimeType: "image/png", data: "AAECAw==" } },
              ],
            },
          },
        ],
      },
    });
    expect(r.image).not.toBeNull();
    expect(r.note).toEqual({ title: "旧", appreciation: "旧文" });
  });

  it("テキストだけ返った場合（鑑賞文の経路）", () => {
    const r = readGeneration({ text: "ただの文章" });
    expect(r.image).toBeNull();
    expect(r.text).toBe("ただの文章");
  });

  it("🔴 止められた理由をそのまま渡す（案内を分けるため）", () => {
    const r = readGeneration({ blockReason: "SAFETY" });
    expect(r.image).toBeNull();
    expect(r.blockReason).toBe("SAFETY");
  });

  it("何も無くても例外にしない", () => {
    const r = readGeneration({});
    expect(r.image).toBeNull();
    expect(r.text).toBe("");
    expect(r.note).toBeNull();
  });
});
