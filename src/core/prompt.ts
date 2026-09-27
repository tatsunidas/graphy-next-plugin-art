/**
 * プロンプトの自動生成。
 *
 * <h3>DICOM タグは「拒否リスト」ではなく「許可リスト」で扱う</h3>
 * 使ってよいのは {@link ALLOWED_DICOM_TAGS} の 2 つだけ。
 * 「PatientName を除く」式の拒否リストは、除き忘れた 1 つが即座に漏洩になるうえ、
 * タグが増えるたびに穴が空く。**使うものを数え上げるほうが安全側に倒れる。**
 *
 * <h3>値もサニタイズする</h3>
 * 施設によっては BodyPartExamined のような自由記述枠に運用上の文字列
 * （検査番号や氏名の断片）が入っていることがある。許可したタグであっても
 * 値をそのまま信用せず、英数字とハイフンだけに落として長さを切る。
 */
import type { Painter } from "./painters";
import { STYLE_BY_ID } from "./styles";

/** プロンプトに入れてよい DICOM タグ。**ここに無いものはコードに登場させない。** */
export const ALLOWED_DICOM_TAGS = ["Modality (0008,0060)", "BodyPartExamined (0018,0015)"] as const;

/** 値の最大長。自由記述枠に長文が入っていても持ち込まない。 */
const MAX_VALUE_CHARS = 32;

/**
 * Modality (0008,0060) の既定用語。DICOM PS3.3 C.7.3.1.1.1 のコード値。
 * **ここに無い値は捨てる。** 施設によっては "CT^..." のように別情報が連結されていることがあり、
 * 文字種フィルタだけでは氏名が生き残る（この穴は test/prompt.test.ts が実際に捕まえた）。
 */
const KNOWN_MODALITIES = new Set([
  "AR", "ASMT", "AU", "BDUS", "BI", "BMD", "CR", "CT", "CTPROTOCOL", "DG", "DMS", "DOC", "DX",
  "ECG", "EEG", "EMG", "EOG", "EPS", "ES", "FID", "GM", "HC", "HD", "IO", "IOL", "IVOCT", "IVUS",
  "KER", "KO", "LEN", "LS", "MG", "MR", "M3D", "NM", "OAM", "OCT", "OP", "OPM", "OPT", "OPTBSV",
  "OPTENF", "OPV", "OSS", "OT", "PLAN", "POS", "PR", "PT", "PX", "REG", "RESP", "RF", "RG",
  "RTDOSE", "RTIMAGE", "RTINTENT", "RTPLAN", "RTRAD", "RTRECORD", "RTSEGANN", "RTSTRUCT",
  "RWV", "SEG", "SM", "SMR", "SR", "SRF", "STAIN", "TEXTUREMAP", "TG", "US", "VA", "XA", "XC",
]);

/**
 * BodyPartExamined (0018,0015) の既定用語（よく使うものに絞った）。
 * 照合時は空白・ハイフン・アンダースコアを除いて比較する（"CHEST ABDOMEN" ≡ "CHESTABDOMEN"）。
 * **ここに無い値は捨てる。** 部位名が 1 つ載らないことより、氏名が 1 つ載ることのほうが重い。
 */
export const BODY_PART_TERMS = [
  "ABDOMEN", "ABDOMENPELVIS", "ADRENAL", "ANKLE", "AORTA", "ARM", "AXILLA", "BACK", "BILEDUCT",
  "BLADDER", "BRAIN", "BREAST", "BRONCHUS", "BUTTOCK", "CALCANEUS", "CALF", "CAROTID",
  "CEREBELLUM", "CERVIX", "CHEEK", "CHEST", "CHESTABDOMEN", "CHESTABDPELVIS", "CIRCLEOFWILLIS",
  "CLAVICLE", "COCCYX", "COLON", "CORNEA", "CORONARYARTERY", "CSPINE", "CTSPINE", "DUODENUM",
  "EAR", "ELBOW", "ESOPHAGUS", "EXTREMITY", "EYE", "EYELID", "FACE", "FEMUR", "FIBULA", "FINGER",
  "FOOT", "GALLBLADDER", "HAND", "HEAD", "HEADNECK", "HEART", "HIP", "HUMERUS", "ILEUM", "ILIUM",
  "JAW", "JEJUNUM", "KIDNEY", "KNEE", "LARYNX", "LEG", "LIVER", "LSPINE", "LSSPINE", "LUNG",
  "MAXILLA", "MEDIASTINUM", "MOUTH", "NECK", "NECKCHEST", "NECKCHESTABDOMEN",
  "NECKCHESTABDPELVIS", "NOSE", "ORBIT", "OVARY", "PANCREAS", "PAROTID", "PATELLA", "PELVIS",
  "PENIS", "PHARYNX", "PROSTATE", "RADIUS", "RADIUSULNA", "RECTUM", "RIB", "SACRUM", "SCALP",
  "SCAPULA", "SCLERA", "SCROTUM", "SHOULDER", "SKULL", "SPINE", "SPLEEN", "SSPINE", "STERNUM",
  "STOMACH", "SUBMANDIBULAR", "TESTIS", "THIGH", "THUMB", "THYMUS", "THYROID", "TIBIA",
  "TIBIAFIBULA", "TLSPINE", "TOE", "TONGUE", "TRACHEA", "TSPINE", "ULNA", "URETER", "URETHRA",
  "UTERUS", "VAGINA", "VULVA", "WRIST", "ZYGOMA",
] as const;

/**
 * 部位は DICOM から取れない（ホスト API にタグ読み出しが無い）ため、UI では
 * この一覧からの任意選択にする。**一覧そのものが許可リスト**なので、
 * 利用者が選べる範囲＝安全な範囲になり、自由入力の穴が開かない。
 */
const KNOWN_BODY_PARTS = new Set<string>(BODY_PART_TERMS);

export interface SourceFacts {
  /** Modality (0008,0060)。例 "CT" / "MR" / "XA"。 */
  modality: string;
  /** BodyPartExamined (0018,0015)。無いことも多い。 */
  bodyPart: string;
}

/**
 * DICOM 由来の文字列を正規化する。英数字・空白・ハイフン・アンダースコアのみ残して大文字化。
 * **これ単体では安全にならない**（"CT^YAMADA TARO" が "CT YAMADA TARO" になるだけ）。
 * 必ず {@link toModality} / {@link toBodyPart} の既定用語照合と組で使うこと。
 */
export function sanitizeFact(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[^A-Za-z0-9 _-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_VALUE_CHARS)
    .toUpperCase();
}

/** 照合用に空白・ハイフン・アンダースコアを除く。 */
function compact(s: string): string {
  return s.replace(/[ _-]/g, "");
}

/** 既定用語に一致する Modality だけを返す。一致しなければ空文字。 */
export function toModality(raw: string | null | undefined): string {
  const v = compact(sanitizeFact(raw));
  return KNOWN_MODALITIES.has(v) ? v : "";
}

/** 既定用語に一致する BodyPartExamined だけを返す。一致しなければ空文字。 */
export function toBodyPart(raw: string | null | undefined): string {
  const v = compact(sanitizeFact(raw));
  return KNOWN_BODY_PARTS.has(v) ? v : "";
}

export interface PromptOptions {
  painter: Painter;
  facts: SourceFacts;
  /** 生成物の説明文をどの言語で返させるか。 */
  locale: "ja" | "en";
}

/** 投稿先（Art of GRAPHY）のタイトル欄の上限。 */
export const TITLE_MAX_CHARS = 80;
/** 投稿先（Art of GRAPHY）の「鑑賞のための説明」欄の上限。 */
export const NOTE_MAX_CHARS = 800;
/**
 * 説明文に狙わせる長さ。**上限よりかなり低く取ってある。**
 *
 * <p>🔴 **生成モデルは文字を数えられない。** 上限だけを伝えると必ず超える
 * （実機で毎回 1400 文字前後になった。2026-09-27・利用者報告）。
 * 日本語 1409 文字 ≒ 800 トークンなので、**モデルは「800」を自分の数え方で守っていた**
 * と見られる。
 *
 * <p>だから**超過ぶんを見込んだ目標**を渡す。1.7 倍に膨らんでも上限に収まる値
 * （450 × 1.7 ≒ 765）。**上限を言うだけで守らせようとしないこと。**
 * アプリ側で切ることはしない（利用者の判断・2026-09-27）——文章のどこを削るかは書いた人が決める。
 */
export const NOTE_TARGET_CHARS = 450;
/** 説明文の文の数。**文字数より守られやすい単位**なので、こちらを主に頼む。 */
export const NOTE_SENTENCES = "four to six";

/**
 * 元画像から「モダリティ・部位」の英文を組み立てる。
 *
 * 🔴 **2 つのプロンプトで必ずこれを通す。** プロンプトが増えるたびに
 * `facts` を直接埋め込むと、許可リストを素通りする経路がそこだけ開く。
 * 以前 `CT^YAMADA TARO` が文字種フィルタを生き延びた穴と同じ形。
 */
function subjectPhrase(facts: SourceFacts): string {
  // 🔴 既定用語に一致しない値は捨てる。部位名が 1 つ落ちることより、氏名が 1 つ載るほうが重い。
  const modality = toModality(facts.modality);
  const bodyPart = toBodyPart(facts.bodyPart);

  return [
    "a greyscale medical radiological image",
    modality ? `acquired with the ${modality} modality` : null,
    bodyPart ? `showing the ${bodyPart} region` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * 画像を生成させるプロンプトを組み立てる。
 *
 * <p>戻り値は同意ダイアログで**全文が利用者に表示される**。読まれる前提で書くこと。
 *
 * <h3>ここでは文章を書かせない</h3>
 * 以前は同じ応答に鑑賞文の JSON も要求していたが、**画像モデルは画像だけを返して
 * 地の文を返さない**（実機で `gemini-3.1-flash-image` が無言で欠落させた）。
 * 鑑賞文は {@link buildNotePrompt} で別に取る。画像側の指示が短くなることで、
 * 「画像の中に文字を描いてしまう」誘因も減る。
 */
export function buildImagePrompt(opts: PromptOptions): string {
  const { painter } = opts;
  const style = STYLE_BY_ID.get(painter.styleId);

  return [
    "You are helping to create a work of art that connects imaging science with aesthetics,",
    "in the spirit of the \"Art of Imaging\" section of a radiology journal.",
    "",
    `Source image: ${subjectPhrase(opts.facts)}.`,
    "",
    "Task: reinterpret the given image as an original artwork, keeping its overall composition and",
    "anatomical structure recognisable, rendered in the following manner:",
    `  Style: ${style ? `${style.nameEn} — ${style.promptHint}` : painter.styleId}`,
    `  In the manner of: ${painter.nameEn} — ${painter.promptHint}`,
    "",
    "Constraints:",
    "  - Create an ORIGINAL interpretation. Do NOT reproduce, copy or closely imitate any specific",
    "    existing painting. Borrow the manner and technique of the style, not a particular work.",
    "  - Do NOT draw any text, letters, numbers, caption, signature or watermark inside the image.",
    "    A signature will be added separately by the application.",
    "  - Do NOT invent or add anatomy, lesions, devices or findings that are not present in the source.",
    "  - Keep the result suitable for public exhibition.",
  ].join("\n");
}

/**
 * 出来上がった作品を見せて、鑑賞のための解説を書かせるプロンプト。
 *
 * <p>送るのは**生成した作品そのもの**で、元の DICOM 画像ではない。実際に出来た絵を
 * 見て書くので記述が具体になり、しかも元画像を二度送らずに済む。
 *
 * <p>出力はそのまま vis-ionary.com の「Art of GRAPHY」投稿フォームへ貼る前提なので、
 * 上限をフォームに合わせてある（タイトル {@link TITLE_MAX_CHARS} 文字 /
 * 説明 {@link NOTE_MAX_CHARS} 文字）。作風とモダリティは投稿先が PNG メタデータから
 * 自動表示するため、**本文に書かせない**（書かせると同じ情報が二重に出る）。
 *
 * <h3>🔴 長さは「文の数」で頼む（2026-09-27 に直した）</h3>
 * 以前は上限だけを伝え、**触れるべき観点を 6 つ**挙げていた（見えるもの・構図・色・光・筆致・
 * 雰囲気）。日本語で 6 つを語れば 1200〜1500 文字になるので、**指示の中身が同じ指示の上限と
 * 矛盾していた**——モデルは抽象的な数より具体的な「この 6 点を書け」に従う。
 * → **観点を 3 つに減らし、文の数（モデルが比較的守れる単位）と
 * {@link NOTE_TARGET_CHARS} を渡す。** 上限は「超えるな」ではなく念のための線として残す。
 */
export function buildNotePrompt(opts: PromptOptions): string {
  const { painter, locale } = opts;
  const style = STYLE_BY_ID.get(painter.styleId);
  const language = locale === "ja" ? "Japanese" : "English";

  return [
    "The attached image is an artwork that was generated from a medical radiological image,",
    "for the \"Art of Imaging\" section of a radiology journal.",
    "",
    `Source of the artwork: ${subjectPhrase(opts.facts)}.`,
    `  Style: ${style ? style.nameEn : painter.styleId}`,
    `  In the manner of: ${painter.nameEn}`,
    "",
    "Task: look at the attached artwork and write an appreciation note for a viewer.",
    `Reply with a single JSON object in a \`\`\`json code block, written in ${language},`,
    "with exactly these keys:",
    `  "title"        — a title for this artwork (at most ${TITLE_MAX_CHARS} characters)`,
    `  "appreciation" — how to look at this artwork.`,
    `                   Write ${NOTE_SENTENCES} sentences, about ${NOTE_TARGET_CHARS} ${language} characters in total,`,
    `                   and never more than ${NOTE_MAX_CHARS} ${language} characters (count characters, not words or tokens).`,
    "                   Cover three things only: what can be seen, then the composition and colour,",
    "                   then the overall impression. Describe THIS image, not the style in general.",
    "",
    "Constraints:",
    "  - Do NOT include any patient information, identifiers, dates or institution names.",
    "  - Do NOT offer a diagnosis, a finding or any clinical interpretation.",
    "  - Do NOT name the painter, the style or the modality: they are shown separately.",
    "  - Describe only what is visually present in the attached image.",
    "  - Return the JSON only, with no commentary outside the code block.",
  ].join("\n");
}
