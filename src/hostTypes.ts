/**
 * ホスト（GRAPHY-Next 本体）から渡される API のうち、**このプラグインが使うものだけ**を宣言する。
 *
 * <p>`graphy-plugin.d.ts` の全体を写さない理由は、写すと本体の更新のたびに差分が出て、
 * 実際には使っていない箇所の食い違いに時間を取られるため。ここに書いたものだけが
 * 「依存している契約」であり、本体を上げるときに確認すべき範囲でもある。
 *
 * <p>元の定義: GRAPHY-Next の `examples/plugin-template/graphy-plugin.d.ts`
 * （リポジトリ直下にコピーがある）。
 */

export interface ViewerTarget {
  tileId: string;
  patientKey: string;
  studyUid: string;
  seriesUid: string;
  seriesLabel: string;
  imageId: string;
  sliceIndex: number;
  sliceCount: number;
  modality: string;
}

export interface ViewerViewState {
  tileId: string;
  windowCenter: number;
  windowWidth: number;
  unit: string;
  colormap: string | null;
  invert: boolean;
}

export interface PixelData {
  tileId: string;
  imageId: string;
  sliceIndex: number;
  rows: number;
  cols: number;
  /** row-major。**校正済みモダリティ値**（CT なら HU）で、表示 W/L は掛かっていない。 */
  data: Float32Array;
  unit: string;
}

/** `host.ai.generate()` の要求（H40）。 */
export interface AiGenerationRequest {
  model: string;
  apiVersion?: string;
  prompt: string;
  imageBytes: Uint8Array;
  mimeType?: string;
  /** 同意を覚える単位。シリーズ UID を渡す。 */
  scopeKey?: string;
  temperature?: number;
  responseModalities?: string[];
}

export type AiGenerationOutcome =
  | { ok: true; data: unknown }
  | { ok: false; error: string; status?: number; kind?: string };

export interface PluginSaveFileOptions {
  defaultName: string;
  bytes: Uint8Array;
  filters?: { name: string; extensions: string[] }[];
}

export type SaveFileResult =
  | { ok: true; filePath: string }
  | { ok: false; canceled?: boolean; error?: string };

export interface Viewer2DPluginHost {
  pluginId: string;
  /** 本体のキーしか引けない。プラグイン自身の文言は `src/i18n/messages.ts`。 */
  t: (key: string) => string;
  /** 活性化した時点の表示言語（`"ja"` / `"en"`）。途中の切り替えには追従しない。 */
  locale: string;
  notify: (message: string) => void;
  getTargets: () => ViewerTarget[];
  getViewState: (tileId?: string) => ViewerViewState | null;
  getPixelData: (tileId?: string, opts?: { sliceIndex?: number }) => Promise<PixelData | null>;
  /** 外部 AI への送信（要 `ai-egress` 権限。同意ダイアログは本体が出す）。 */
  ai: { generate: (req: AiGenerationRequest) => Promise<AiGenerationOutcome> };
  /** 名前を付けて保存（上書き確認は OS のダイアログが出す）。 */
  file: { saveAs: (opts: PluginSaveFileOptions) => Promise<SaveFileResult> };
}

export interface PluginModule {
  activate(host: Viewer2DPluginHost): void | Promise<void>;
}
