/**
 * プロンプトに患者情報が混ざらないことの回帰テスト。
 *
 * <p>これがこのプラグインで最も落としてはいけない性質。プロンプト全文は同意ダイアログで
 * 利用者に見せるが、**見せているから安全なのではなく、そもそも入らないから安全**でなければ
 * ならない（毎回きちんと読む利用者を前提にした設計は、いずれ破れる）。
 */
import { describe, expect, it } from "vitest";
import {
  buildImagePrompt,
  buildNotePrompt,
  sanitizeFact,
  toBodyPart,
  toModality,
} from "../src/core/prompt";
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

describe("buildImagePrompt", () => {
  const facts = { modality: "CT", bodyPart: "CHEST" };

  it("モダリティと部位は載る", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("CT");
    expect(p).toContain("CHEST");
  });

  it("画家名と様式のヒントが載る", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("Katsushika Hokusai");
    expect(p).toContain("Ukiyo-e");
  });

  it("特定作品の複製を禁じる指示が入る", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT reproduce, copy or closely imitate any specific/);
  });

  it("画像内へ文字や署名を描かせない指示が入る（署名はローカルで合成するため）", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT draw any text, letters, numbers, caption, signature or watermark/);
  });

  it("所見の捏造を禁じる指示が入る", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT invent or add anatomy, lesions, devices or findings/);
  });

  // 🔴 画像モデルは地の文を返さない（実機で鑑賞文が丸ごと欠落した）。
  //    画像プロンプトに文章を要求する指示が**戻らないこと**を見張る。
  it("鑑賞文の JSON を要求しない（文章はテキストモデルに書かせる）", () => {
    const p = buildImagePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).not.toContain("json");
    expect(p).not.toContain("appreciation");
  });

  it("部位が空でも壊れず、余計な語も残さない", () => {
    const p = buildImagePrompt({ painter: hokusai, facts: { modality: "MR", bodyPart: "" }, locale: "ja" });
    expect(p).toContain("MR");
    expect(p).not.toContain("showing the  region");
  });
});

describe("buildNotePrompt", () => {
  const facts = { modality: "CT", bodyPart: "CHEST" };

  it("題名と鑑賞文の 2 つを JSON で要求する", () => {
    const p = buildNotePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("```json");
    expect(p).toContain('"title"');
    expect(p).toContain('"appreciation"');
  });

  it("投稿フォームの上限を指示に入れる", () => {
    const p = buildNotePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toContain("80 characters");
    expect(p).toContain("800 characters");
  });

  it("説明の言語がロケールで切り替わる", () => {
    expect(buildNotePrompt({ painter: hokusai, facts, locale: "ja" })).toContain("written in Japanese");
    expect(buildNotePrompt({ painter: hokusai, facts, locale: "en" })).toContain("written in English");
  });

  it("診断・所見を述べさせない", () => {
    const p = buildNotePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT offer a diagnosis/);
  });

  // 作風とモダリティは投稿先が PNG メタデータから出すので、本文に書かせると二重になる。
  it("画家・様式・モダリティを本文に書かせない", () => {
    const p = buildNotePrompt({ painter: hokusai, facts, locale: "ja" });
    expect(p).toMatch(/Do NOT name the painter, the style or the modality/);
  });
});

/**
 * 🔴 **PHI の規律は、プロンプトが何本になっても全部に掛ける。**
 *
 * 以前 `CT^YAMADA TARO` が文字種フィルタを生き延びた穴を開けており、プロンプトを
 * 2 本に分けた今が同じ穴を開ける好機だった。新しいプロンプトを足したら、
 * **この配列に並べるまで通さない**こと。
 */
describe.each([
  ["buildImagePrompt", buildImagePrompt],
  ["buildNotePrompt", buildNotePrompt],
])("%s の個人情報の扱い", (_name, build) => {
  it("🔴 汚染された DICOM 値を渡しても患者情報が出力に現れない", () => {
    // 施設によっては自由記述枠に運用文字列が入る。許可したタグでも値は信用しない。
    const dirty = {
      modality: "CT^YAMADA TARO",
      bodyPart: "CHEST 1990-01-01 ID:123456789 山田太郎 Tokyo General Hospital",
    };
    const p = build({ painter: hokusai, facts: dirty, locale: "ja" });
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
    const p = build({ painter: hokusai, facts: extra, locale: "ja" });
    expect(p).not.toContain("YAMADA");
    expect(p).not.toContain("0001234");
    expect(p).not.toContain("20260922");
    expect(p).not.toContain("Tokyo General");
  });
});
