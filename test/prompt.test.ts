/**
 * プロンプトに患者情報が混ざらないことの回帰テスト。
 *
 * <p>これがこのプラグインで最も落としてはいけない性質。プロンプト全文は同意ダイアログで
 * 利用者に見せるが、**見せているから安全なのではなく、そもそも入らないから安全**でなければ
 * ならない（毎回きちんと読む利用者を前提にした設計は、いずれ破れる）。
 */
import { describe, expect, it } from "vitest";
import { buildPrompt, sanitizeFact, toBodyPart, toModality } from "../src/core/prompt";
import { PAINTER_BY_ID } from "../src/core/painters";

const hokusai = PAINTER_BY_ID.get("hokusai")!;

describe("sanitizeFact — 正規化のみ（これ単体では安全にならない）", () => {
  it("英数字・空白・ハイフンだけ残して大文字化する", () => {
    expect(sanitizeFact("chest")).toBe("CHEST");
    expect(sanitizeFact("chest-abdomen")).toBe("CHEST-ABDOMEN");
  });

  it("日本語や記号は落ちる", () => {
    expect(sanitizeFact("胸部 山田太郎")).toBe("");
  });

  it("長すぎる値は切り詰める", () => {
    expect(sanitizeFact("A".repeat(200)).length).toBeLessThanOrEqual(32);
  });

  it("null / undefined / 空文字は空文字", () => {
    expect(sanitizeFact(null)).toBe("");
    expect(sanitizeFact(undefined)).toBe("");
    expect(sanitizeFact("   ")).toBe("");
  });

  it("🔴 連結された別情報は残ってしまう ＝ だから既定用語照合が要る", () => {
    // この性質こそが toModality / toBodyPart を置いている理由。記録として固定しておく。
    expect(sanitizeFact("CT^YAMADA TARO")).toBe("CT YAMADA TARO");
  });
});

describe("toModality / toBodyPart — 既定用語の許可リスト", () => {
  it("既定用語はそのまま通る", () => {
    expect(toModality("CT")).toBe("CT");
    expect(toModality("mr")).toBe("MR");
    expect(toBodyPart("CHEST")).toBe("CHEST");
    expect(toBodyPart("chest abdomen")).toBe("CHESTABDOMEN");
  });

  it("既定用語に無い値は捨てる", () => {
    expect(toModality("CT^YAMADA TARO")).toBe("");
    expect(toModality("SOMETHING")).toBe("");
    expect(toBodyPart("CHEST 1990-01-01 ID:123456789")).toBe("");
    expect(toBodyPart("山田太郎")).toBe("");
  });

  it("空・null は空文字", () => {
    expect(toModality(null)).toBe("");
    expect(toBodyPart(undefined)).toBe("");
  });
});

describe("buildPrompt", () => {
  const facts = { modality: "CT", bodyPart: "CHEST" };

  it("モダリティと部位は載る", () => {
    const p = buildPrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("CT");
    expect(p).toContain("CHEST");
  });

  it("画家名と様式のヒントが載る", () => {
    const p = buildPrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("Katsushika Hokusai");
    expect(p).toContain("Ukiyo-e");
  });

  it("特定作品の複製を禁じる指示が入る", () => {
    const p = buildPrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT reproduce, copy or closely imitate any specific/);
  });

  it("画像内へ文字や署名を描かせない指示が入る（署名はローカルで合成するため）", () => {
    const p = buildPrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT draw any text, letters, numbers, caption, signature or watermark/);
  });

  it("所見の捏造を禁じる指示が入る", () => {
    const p = buildPrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT invent or add anatomy, lesions, devices or findings/);
  });

  it("説明の言語がロケールで切り替わる", () => {
    expect(buildPrompt({ painter: hokusai, facts, locale: "ja" })).toContain("written in Japanese");
    expect(buildPrompt({ painter: hokusai, facts, locale: "en" })).toContain("written in English");
  });

  it("部位が空でも壊れず、余計な語も残さない", () => {
    const p = buildPrompt({ painter: hokusai, facts: { modality: "MR", bodyPart: "" }, locale: "ja" });
    expect(p).toContain("MR");
    expect(p).not.toContain("showing the  region");
  });

  it("🔴 汚染された DICOM 値を渡しても患者情報が出力に現れない", () => {
    // 施設によっては自由記述枠に運用文字列が入る。許可したタグでも値は信用しない。
    const dirty = {
      modality: "CT^YAMADA TARO",
      bodyPart: "CHEST 1990-01-01 ID:123456789 山田太郎 Tokyo General Hospital",
    };
    const p = buildPrompt({ painter: hokusai, facts: dirty, locale: "ja" });
    expect(p).not.toContain("YAMADA");
    expect(p).not.toContain("山田");
    expect(p).not.toContain("1990");
    expect(p).not.toContain("123456789");
    expect(p).not.toContain("Hospital");
    // 既定用語に一致しないので、モダリティ・部位ごと落ちる（＝安全側に倒れる）。
    expect(p).not.toMatch(/acquired with the .* modality/);
    expect(p).not.toMatch(/showing the .* region/);
  });

  it("🔴 許可リスト外のフィールドを足しても、型の外にあるものは出力に混ざらない", () => {
    // 呼び出し側が余計なものを載せてきても素通りしないこと。
    const extra = {
      modality: "CT",
      bodyPart: "CHEST",
      patientName: "YAMADA TARO",
      patientId: "0001234",
      studyDate: "20260922",
      institution: "Tokyo General Hospital",
    } as unknown as { modality: string; bodyPart: string };
    const p = buildPrompt({ painter: hokusai, facts: extra, locale: "ja" });
    expect(p).not.toContain("YAMADA");
    expect(p).not.toContain("0001234");
    expect(p).not.toContain("20260922");
    expect(p).not.toContain("Tokyo General");
  });
});
