/**
 * 生成物に添える `graphy-art` メタデータの組み立て。
 *
 * <h3>患者識別子は入れない</h3>
 * `source` に入れてよいのはプロンプトと同じ 2 項目（モダリティ・部位）だけ。
 * StudyInstanceUID や SeriesInstanceUID すら入れない——UID は施設内では
 * 患者を一意に指す鍵として機能するため、公開前提の作品に添える情報ではない。
 */
import { GRAPHY_ART_SPEC } from "./pngMeta";
import type { SignatureOptions } from "./signature";

export interface GraphyArtMetadata {
  spec: string;
  generator: string;
  /** 本体のバージョン（取得できなければ空文字＝**捏造しない**）。 */
  appVersion: string;
  pluginVersion: string;
  createdAt: string;
  model: string;
  style: { styleId: string; painterId: string; painterName: string };
  signature: { text: string; position: string; font: string };
  source: { modality: string; bodyPart: string };
  prompt: string;
  /** 送信した 8-bit RGB（生画素）の SHA-256。 */
  sourceImageSha256: string;
  /** 完成画像の生 RGBA の SHA-256。**ファイルではなく画素のハッシュ。** */
  imageSha256: string;
  /** 再エンコード耐性のある知覚ハッシュ（16 桁 hex）。 */
  pHash: string;
}

export interface BuildMetadataInput {
  appVersion: string;
  pluginVersion: string;
  model: string;
  styleId: string;
  painterId: string;
  painterName: string;
  signature: SignatureOptions;
  modality: string;
  bodyPart: string;
  prompt: string;
  sourceImageSha256: string;
  imageSha256: string;
  pHash: string;
  /** テストのために差し替えられるようにしておく。 */
  now?: Date;
}

export function buildMetadata(input: BuildMetadataInput): GraphyArtMetadata {
  return {
    spec: GRAPHY_ART_SPEC,
    generator: "GRAPHY-Next Art of Imaging",
    appVersion: input.appVersion,
    pluginVersion: input.pluginVersion,
    createdAt: (input.now ?? new Date()).toISOString(),
    model: input.model,
    style: { styleId: input.styleId, painterId: input.painterId, painterName: input.painterName },
    signature: {
      text: input.signature.text,
      position: input.signature.position,
      font: input.signature.fontId,
    },
    source: { modality: input.modality, bodyPart: input.bodyPart },
    prompt: input.prompt,
    sourceImageSha256: input.sourceImageSha256,
    imageSha256: input.imageSha256,
    pHash: input.pHash,
  };
}

/** 保存時の既定ファイル名。OS のダイアログで書き換えられる。 */
export function defaultFileName(painterId: string, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  return `graphy-art-${painterId}-${stamp}.png`;
}
