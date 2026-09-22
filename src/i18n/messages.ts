/**
 * プラグイン自身の文言。
 *
 * <p>`host.t()` は本体のキーしか引けないので、自前の辞書を持つ。
 * 言語判定は `host.locale`（活性化した時点の値）を使う。
 * 本体の言語を切り替えたらプラグインを開き直す必要がある——これは host API の仕様。
 */
export type Lang = "ja" | "en";

const JA = {
  title: "Art of Imaging",
  subtitle: "画像科学と美学を結ぶ作品をつくる",

  step1: "1. 作風と画家",
  style: "様式",
  styleAll: "すべての様式",
  searchPainter: "画家を検索（部分一致）",
  noPainter: "該当する画家がいません",
  selected: "選択中",
  pdNote: "収録しているのはパブリックドメインの画家のみです（没年 1944 年以前。日本の戦時加算を考慮）。",

  step2: "2. サイン",
  signatureText: "サインの文字",
  signaturePosition: "位置",
  signatureFont: "フォント",
  signatureSize: "大きさ",
  signatureColorNote: "色は黒のみです。日本語のサインは OS によって字形が変わります。",

  step3: "3. 元画像",
  bodyPart: "部位（任意）",
  bodyPartNone: "指定しない",
  bodyPartNote: "DICOM から部位は読み出せないため、必要なら一覧から選んでください。",
  sourcePreview: "送信する画像",

  generate: "作品を生成する",
  generating: "生成中…",
  save: "名前を付けて保存",
  close: "閉じる",

  result: "生成結果",
  resultModality: "モダリティ",
  resultSubject: "画像に写っているもの",
  resultAppreciation: "鑑賞のために",
  caveat: "この説明は AI が生成した鑑賞用の記述であり、診断・所見ではありません。研究・教育・芸術表現の目的にのみ使用してください。",
  modalityNote: "モダリティは DICOM の値です（AI の出力では上書きしていません）。",

  errNoTarget: "対象の画像がありません。2D ビューアで画像を開いてから実行してください。",
  errNoPixels: "画素を読み出せませんでした。",
  errNoPainter: "画家を 1 名選んでください。",
  errNoKey: "Gemini の API キーが未設定です。環境設定 ＞ 外部 AI で設定してください。",
  errPermission: "このプラグインには外部送信の権限がありません。",
  errDesktopOnly: "この機能はデスクトップ版でのみ利用できます。",
  errNoImage: "画像が返りませんでした。",
  errBlocked: "生成が拒否されました（理由: {reason}）。プロンプトや画像を変えて試してください。",
  errBusy: "前の生成がまだ実行中です。",
  errGeneric: "生成に失敗しました: {error}",
  saved: "保存しました: {path}",
  saveFailed: "保存に失敗しました: {error}",

  privacyTitle: "個人情報の取り扱い",
  privacy1: "画像は第三者（Google）のクラウドへ送信されます。院内規程・倫理審査・患者同意の範囲内でのみ使用してください。",
  privacy2: "画素に焼き込まれた患者情報は取り除かれません。上のプレビューで必ず確認してください。",
  privacy3: "無料枠では入力がモデル改善に利用され得ます。患者由来の画像は有料ティアで扱ってください。",
} as const;

const EN: Record<keyof typeof JA, string> = {
  title: "Art of Imaging",
  subtitle: "Create a work that connects imaging science with aesthetics",

  step1: "1. Style and painter",
  style: "Style",
  styleAll: "All styles",
  searchPainter: "Search painters (substring)",
  noPainter: "No matching painter",
  selected: "Selected",
  pdNote: "Only public-domain painters are listed (died 1944 or earlier, allowing for Japan's wartime extension).",

  step2: "2. Signature",
  signatureText: "Signature text",
  signaturePosition: "Position",
  signatureFont: "Font",
  signatureSize: "Size",
  signatureColorNote: "Black only. A Japanese signature will look different depending on the OS.",

  step3: "3. Source image",
  bodyPart: "Body part (optional)",
  bodyPartNone: "Not specified",
  bodyPartNote: "The body part cannot be read from DICOM here, so pick one from the list if you want it included.",
  sourcePreview: "Image to be sent",

  generate: "Generate artwork",
  generating: "Generating...",
  save: "Save as",
  close: "Close",

  result: "Result",
  resultModality: "Modality",
  resultSubject: "What is shown",
  resultAppreciation: "How to look at it",
  caveat: "This description is an AI-generated appreciation note, not a diagnosis or a radiological finding. Use it for research, education and artistic expression only.",
  modalityNote: "The modality comes from DICOM (it is not overwritten by the model's output).",

  errNoTarget: "No target image. Open an image in the 2D viewer first.",
  errNoPixels: "Could not read the pixel data.",
  errNoPainter: "Select one painter.",
  errNoKey: "The Gemini API key is not set. Configure it in Settings > External AI.",
  errPermission: "This plugin does not have permission to send data externally.",
  errDesktopOnly: "This feature is available in the desktop app only.",
  errNoImage: "No image was returned.",
  errBlocked: "Generation was refused (reason: {reason}). Try a different prompt or image.",
  errBusy: "A previous generation is still running.",
  errGeneric: "Generation failed: {error}",
  saved: "Saved: {path}",
  saveFailed: "Failed to save: {error}",

  privacyTitle: "Handling of personal information",
  privacy1: "The image is sent to a third-party (Google) cloud service. Use it only within your institution's policies, ethics approval and patient consent.",
  privacy2: "Patient information burned into the pixels is not removed. Always check the preview above.",
  privacy3: "On the free tier your input may be used to improve the model. Use a paid tier for patient-derived images.",
};

export type MessageKey = keyof typeof JA;

/** 辞書引き＋`{name}` 差し込み。本体の `{{name}}` とは別系統（自前辞書なので混同しない）。 */
export function makeT(locale: string): (key: MessageKey, vars?: Record<string, string>) => string {
  const dict: Record<MessageKey, string> = locale === "en" ? EN : JA;
  return (key, vars) => {
    let s: string = dict[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  };
}
