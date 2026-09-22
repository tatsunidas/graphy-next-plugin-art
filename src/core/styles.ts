/**
 * 様式（作風）。UI の一次軸はこちらで、画家はその下に置く。
 *
 * <p>そうしている理由は 2 つある。第一に、**画風・様式そのものは著作権の保護対象ではない**
 * ので、様式を軸にすると法的に安全な側から選ばせることになる。第二に、利用者が言いたいのは
 * たいてい「浮世絵みたいに」であって「歌麿の 1793 年頃の作風で」ではない。
 */
export type StyleId =
  | "renaissance"
  | "baroque"
  | "romanticism"
  | "realism"
  | "impressionism"
  | "postImpressionism"
  | "symbolism"
  | "expressionism"
  | "cubism"
  | "abstract"
  | "naive"
  | "ukiyoe";

export interface Style {
  id: StyleId;
  nameJa: string;
  nameEn: string;
  /** プロンプトに差し込む様式の要点（英語）。画家の promptHint と合成される。 */
  promptHint: string;
}

export const STYLES: Style[] = [
  {
    id: "renaissance",
    nameJa: "ルネサンス／初期フランドル",
    nameEn: "Renaissance / Early Netherlandish",
    promptHint:
      "balanced classical composition, precise linear perspective, sculptural modelling of form, " +
      "egg-tempera and early oil glazing, restrained jewel-like colour",
  },
  {
    id: "baroque",
    nameJa: "バロック／マニエリスム",
    nameEn: "Baroque / Mannerism",
    promptHint:
      "dramatic chiaroscuro, a single raking light source, deep warm shadow, " +
      "theatrical diagonal composition, rich impasto highlights",
  },
  {
    id: "romanticism",
    nameJa: "ロマン主義／新古典",
    nameEn: "Romanticism / Neoclassicism",
    promptHint:
      "sublime atmosphere, turbulent light and weather, luminous glazes dissolving contour, " +
      "sweeping emotive gesture",
  },
  {
    id: "realism",
    nameJa: "写実主義／バルビゾン",
    nameEn: "Realism / Barbizon",
    promptHint:
      "earthy tonal palette, unidealised observation, weighty solid forms, " +
      "soft natural daylight, matte surface",
  },
  {
    id: "impressionism",
    nameJa: "印象派",
    nameEn: "Impressionism",
    promptHint:
      "broken brushwork, optical mixing of pure colour, luminous daylight, " +
      "soft dissolved contours, coloured shadows rather than grey",
  },
  {
    id: "postImpressionism",
    nameJa: "後期印象派／点描",
    nameEn: "Post-Impressionism / Pointillism",
    promptHint:
      "structural brushstrokes with expressive direction, saturated non-naturalistic colour, " +
      "strong surface pattern, visible touch",
  },
  {
    id: "symbolism",
    nameJa: "象徴主義／世紀末",
    nameEn: "Symbolism / Fin de siecle",
    promptHint:
      "decorative flattened space, sinuous contour, ornamental gold and pattern, " +
      "dreamlike mood, stylised silhouette",
  },
  {
    id: "expressionism",
    nameJa: "表現主義／青騎士",
    nameEn: "Expressionism / Der Blaue Reiter",
    promptHint:
      "emotionally charged arbitrary colour, distorted simplified form, " +
      "bold contour, rhythmic abstracted shapes",
  },
  {
    id: "cubism",
    nameJa: "キュビスム／未来派／構成主義",
    nameEn: "Cubism / Futurism / Constructivism",
    promptHint:
      "faceted geometric planes, simultaneous multiple viewpoints, shallow ambiguous space, " +
      "restrained ochre and grey with sharp accents",
  },
  {
    id: "abstract",
    nameJa: "抽象／デ・ステイル",
    nameEn: "Abstraction / De Stijl",
    promptHint:
      "pure geometric abstraction, flat unmodulated planes, deliberate asymmetric balance, " +
      "reduced primary palette, crisp edges",
  },
  {
    id: "naive",
    nameJa: "素朴派／アメリカ絵画",
    nameEn: "Naive art / American painting",
    promptHint:
      "frontal clarity, meticulous outlined detail, flattened depth, " +
      "calm even light, plain honest description",
  },
  {
    id: "ukiyoe",
    nameJa: "浮世絵／日本画",
    nameEn: "Ukiyo-e / Japanese painting",
    promptHint:
      "flat areas of colour bounded by confident outline, asymmetric cropped composition, " +
      "woodblock print texture with visible key-block line, empty space as compositional element, " +
      "ink wash gradation",
  },
];

export const STYLE_BY_ID = new Map<StyleId, Style>(STYLES.map((s) => [s.id, s]));
