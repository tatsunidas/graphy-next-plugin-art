/**
 * Gemini のレスポンス解析。
 *
 * <p>Electron main の中継層は JSON を素通しするだけなので、解釈はここが全部引き受ける。
 * そうしている理由は単純で、**main.js には単体テストの仕組みが無い**から。
 * 形の揺れを吸収する仕事は、試験できる側に置く。
 *
 * <h3>キー名の揺れを両方受ける</h3>
 * リクエストの例は snake_case（`inline_data`）で書かれているが、REST のレスポンスは
 * camelCase（`inlineData`）で返ることがある。どちらでも拾えるようにしておく
 * ——ここを決め打ちにすると、ある日いきなり「画像が返らない」になる。
 */

export interface ParsedGeneration {
  /** 生成画像（base64 をデコードしたもの）。無ければ null。 */
  image: Uint8Array | null;
  imageMimeType: string | null;
  /** モデルが返した地の文（JSON ブロックを含む）。 */
  text: string;
  /** 地の文から取り出した鑑賞情報（題名と鑑賞文）。取れなければ null。 */
  note: AppreciationNote | null;
}

export interface AppreciationNote {
  /**
   * 作品の題名の案。投稿先のタイトル欄（80 文字）へ貼る前提。
   * **長さはここでは切らない。** 文の途中で切れた題名を貼らせるより、
   * 超えたことを画面に出して直してもらうほうがよい。
   */
  title: string;
  /** 鑑賞のための説明。投稿先の必須欄（800 文字）へ貼る前提。 */
  appreciation: string;
}

type AnyRecord = Record<string, unknown>;

function asRecord(v: unknown): AnyRecord | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as AnyRecord) : null;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** `inlineData` / `inline_data` のどちらでも拾う。 */
function readInlineData(part: AnyRecord): { data: string; mimeType: string } | null {
  const inline = asRecord(part.inlineData) ?? asRecord(part.inline_data);
  if (!inline) return null;
  const data = inline.data;
  if (typeof data !== "string" || data.length === 0) return null;
  const mime = inline.mimeType ?? inline.mime_type;
  return { data, mimeType: typeof mime === "string" ? mime : "image/png" };
}

/**
 * ```json ブロック（無ければ最初の { ... }）から鑑賞情報を取り出す。
 * **取れなくても例外にしない。** 画像が返っているなら、説明が無いだけで作品は成立する。
 *
 * <p>片方のキーしか無くても拾う。モデルが `title` だけ返すことも
 * `appreciation` だけ返すこともあり、**半分でも無いよりはよい**。
 */
export function extractNote(text: string): AppreciationNote | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidates = [fenced?.[1], text];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) continue;
    try {
      const obj = asRecord(JSON.parse(candidate.slice(start, end + 1)));
      if (!obj) continue;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const appreciation = typeof obj.appreciation === "string" ? obj.appreciation.trim() : "";
      if (title || appreciation) return { title, appreciation };
    } catch {
      // 次の候補を試す
    }
  }
  return null;
}

/** `generateContent` のレスポンスから画像と説明を取り出す。 */
export function parseGeneration(raw: unknown): ParsedGeneration {
  const root = asRecord(raw);
  const candidates = root?.candidates;
  const first = Array.isArray(candidates) ? asRecord(candidates[0]) : null;
  const content = asRecord(first?.content);
  const parts = Array.isArray(content?.parts) ? content.parts : [];

  let image: Uint8Array | null = null;
  let imageMimeType: string | null = null;
  const texts: string[] = [];

  for (const p of parts) {
    const part = asRecord(p);
    if (!part) continue;
    if (typeof part.text === "string" && part.text.length > 0) texts.push(part.text);
    if (!image) {
      const inline = readInlineData(part);
      if (inline) {
        try {
          image = base64ToBytes(inline.data);
          imageMimeType = inline.mimeType;
        } catch {
          // base64 が壊れていれば画像なしとして扱う（テキストは活かす）
        }
      }
    }
  }

  const text = texts.join("\n").trim();
  return { image, imageMimeType, text, note: extractNote(text) };
}

/**
 * 画像が返らなかったときの理由を、利用者に見せられる程度に取り出す。
 * 安全フィルタで止まると `finishReason` や `promptFeedback.blockReason` に理由が入る。
 */
export function readBlockReason(raw: unknown): string | null {
  const root = asRecord(raw);
  const feedback = asRecord(root?.promptFeedback);
  if (typeof feedback?.blockReason === "string") return feedback.blockReason;
  const candidates = root?.candidates;
  const first = Array.isArray(candidates) ? asRecord(candidates[0]) : null;
  const finish = first?.finishReason;
  if (typeof finish === "string" && finish !== "STOP") return finish;
  return null;
}


/**
 * 本体からの結果を 1 つの形へ揃える。
 *
 * <p>🔑 **本体が正規化してくれるならそれを使い、してくれないなら自分で解釈する。**
 * 0.3.0 の本体は提供元の生レスポンス（`data`）しか返さないが、0.3.1 以降は
 * `image` / `text` を提供元非依存の形で返す（本体の `fw/ai-routing-design.md` §3.2）。
 * このプラグインは `engines.graphy >= 0.3.0` を名乗っているので、**両方を受けられないと
 * 古い本体で動かなくなる。**
 *
 * <p>🔴 **判定をここ 1 か所に閉じる。** 作品生成と鑑賞文の 2 経路で別々に書くと、
 * 片方だけ古い解釈のまま残る（そして例外は出ず、画像か文章が黙って落ちるだけになる）。
 */
export function readGeneration(outcome: {
  image?: { bytes: Uint8Array; mimeType: string };
  text?: string;
  blockReason?: string;
  data?: unknown;
}): ParsedGeneration & { blockReason?: string } {
  // 本体が畳んでいる場合（0.3.1 以降）。
  if (outcome.image || outcome.text !== undefined) {
    const text = outcome.text ?? "";
    return {
      image: outcome.image ? outcome.image.bytes : null,
      imageMimeType: outcome.image ? outcome.image.mimeType : null,
      text,
      note: extractNote(text),
      blockReason: outcome.blockReason,
    };
  }
  // 古い本体。生レスポンスを自分で読む。
  return { ...parseGeneration(outcome.data), blockReason: outcome.blockReason };
}
