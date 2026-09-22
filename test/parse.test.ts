/**
 * Gemini レスポンス解析の検査。キー名の揺れと「画像が返らない」場合の扱いが要点。
 */
import { describe, expect, it } from "vitest";
import { extractNote, parseGeneration, readBlockReason } from "../src/core/parse";

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
        { text: '```json\n{"subject":"胸部CT","appreciation":"静かな構図"}\n```' },
        { inlineData: { mimeType: "image/png", data: IMAGE_B64 } },
      ]),
    );
    expect(r.image).not.toBeNull();
    expect(r.note).toEqual({ subject: "胸部CT", appreciation: "静かな構図" });
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
    expect(extractNote('前置き\n```json\n{"subject":"a","appreciation":"b"}\n```\n後置き')).toEqual({
      subject: "a",
      appreciation: "b",
    });
  });

  it("コードフェンスが無い素の JSON でも取り出す", () => {
    expect(extractNote('{"subject":"a","appreciation":"b"}')).toEqual({ subject: "a", appreciation: "b" });
  });

  it("片方のキーしか無くても拾う", () => {
    expect(extractNote('{"appreciation":"b"}')).toEqual({ subject: "", appreciation: "b" });
  });

  it("JSON が無ければ null（例外にしない）", () => {
    expect(extractNote("ただの文章です")).toBeNull();
    expect(extractNote("")).toBeNull();
  });

  it("壊れた JSON でも null で済ませる", () => {
    expect(extractNote("```json\n{subject:\n```")).toBeNull();
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
