/**
 * 画家カタログ。**パブリックドメインの画家しか載せない。**
 *
 * <h3>なぜ「没後 70 年」ではなく「没年 1944 年以前」なのか</h3>
 * 日本の著作権保護期間は原則「死後 70 年」だが、連合国民が 1941 年 12 月 7 日以前に
 * 取得した著作権には**戦時加算**（最大およそ 10 年 5 か月）が上乗せされる。
 * 単純に「今年 − 70」で切ると、マティス（1954 没）のように「死後 70 年は過ぎたが
 * 日本ではまだ保護期間内」という画家を取り込んでしまう。
 * そこで加算分を織り込んだ {@link PD_CUTOFF_YEAR} で切る。
 * この判定は {@code test/painters.test.ts} が全件について機械的に検査する。
 *
 * <h3>そもそも何が危ないのか</h3>
 * 画風・様式それ自体は著作権の保護対象ではない。実際のリスクは
 *   (a) 特定の保護作品をほぼそのまま再現させてしまうこと
 *   (b) 存命作家の人格権・パブリシティ
 *   (c) 生成モデル側のポリシー拒否
 * の 3 つで、いずれもパブリックドメインの画家に限れば実務上ほぼ回避できる。
 * プロンプト側でも「特定作品の複製ではなく様式の翻案」であることを明示する
 * （{@code src/core/prompt.ts}）。
 *
 * <h3>意図的に除外している画家</h3>
 * マティス(1954)、ポロック(1956)、川瀬巴水(1957)、横山大観(1958)、藤田嗣治(1968)、
 * ピカソ(1973)、シャガール(1985)、ダリ(1989)、エドワード・ホッパー(1967)、
 * フリーダ・カーロ(1954 — メキシコは死後 100 年)、および存命の全作家。
 * **「有名だから」という理由でここへ足さないこと。** 足すなら没年を確認し、
 * テストが通ることを確かめること。
 */
import type { StyleId } from "./styles";

/**
 * これ以前に没した画家のみ収録する。
 * 1944 年没 → 日本での保護期間は 2014 年末 ＋ 戦時加算（3794 日）≒ 2025 年 5 月に満了。
 */
export const PD_CUTOFF_YEAR = 1944;

export interface Painter {
  id: string;
  nameJa: string;
  nameEn: string;
  born: number | null;
  /** 没年。不明なら null（その場合は pdYear が判定の根拠になる）。 */
  died: number | null;
  /**
   * パブリックドメイン判定に使う年。通常は没年と同じ。
   * 没年不詳の歴史上の絵師では活動期の年を入れ、根拠を {@link note} に書く。
   */
  pdYear: number;
  styleId: StyleId;
  nationality: string;
  /** 部分一致検索用の別名・関連語（ローマ字表記の揺れを吸収する）。 */
  keywords: string[];
  /** プロンプトに差し込むこの画家固有の要点（英語）。 */
  promptHint: string;
  /** 没年が不詳な場合などの補足。UI に出す。 */
  note?: string;
}

export const PAINTERS: Painter[] = [
  // ── ルネサンス／初期フランドル ──────────────────────────────────────────
  { id: "leonardo", nameJa: "レオナルド・ダ・ヴィンチ", nameEn: "Leonardo da Vinci", born: 1452, died: 1519, pdYear: 1519, styleId: "renaissance", nationality: "Italian", keywords: ["davinci", "vinci"], promptHint: "sfumato, smoky transitions with no hard outline, subtle anatomical structure, muted umber and olive" },
  { id: "michelangelo", nameJa: "ミケランジェロ", nameEn: "Michelangelo", born: 1475, died: 1564, pdYear: 1564, styleId: "renaissance", nationality: "Italian", keywords: ["buonarroti"], promptHint: "monumental sculptural volume, powerful torsion, fresco surface, terracotta and cool blue" },
  { id: "raphael", nameJa: "ラファエロ", nameEn: "Raphael", born: 1483, died: 1520, pdYear: 1520, styleId: "renaissance", nationality: "Italian", keywords: ["raffaello", "sanzio"], promptHint: "serene harmony, clear stable geometry, soft even light, limpid colour" },
  { id: "botticelli", nameJa: "ボッティチェリ", nameEn: "Sandro Botticelli", born: 1445, died: 1510, pdYear: 1510, styleId: "renaissance", nationality: "Italian", keywords: ["sandro"], promptHint: "flowing linear contour, pale luminous flesh, decorative rhythm, tempera delicacy" },
  { id: "vanEyck", nameJa: "ヤン・ファン・エイク", nameEn: "Jan van Eyck", born: 1390, died: 1441, pdYear: 1441, styleId: "renaissance", nationality: "Flemish", keywords: ["eyck", "van eyck"], promptHint: "microscopic oil detail, deep translucent glazes, jewel-like saturated colour, meticulous texture" },
  { id: "durer", nameJa: "アルブレヒト・デューラー", nameEn: "Albrecht Durer", born: 1471, died: 1528, pdYear: 1528, styleId: "renaissance", nationality: "German", keywords: ["duerer", "durer", "albrecht"], promptHint: "engraving-like precision, dense parallel hatching, austere northern detail" },
  { id: "bosch", nameJa: "ヒエロニムス・ボス", nameEn: "Hieronymus Bosch", born: 1450, died: 1516, pdYear: 1516, styleId: "renaissance", nationality: "Netherlandish", keywords: ["hieronymus"], promptHint: "fantastical proliferating detail, pale acid palette, dreamlike incongruity" },
  { id: "bruegel", nameJa: "ピーテル・ブリューゲル（父）", nameEn: "Pieter Bruegel the Elder", born: 1525, died: 1569, pdYear: 1569, styleId: "renaissance", nationality: "Flemish", keywords: ["brueghel", "pieter"], promptHint: "high panoramic viewpoint, teeming small figures, earthy green and ochre, wintry light" },

  // ── バロック／マニエリスム ──────────────────────────────────────────────
  { id: "caravaggio", nameJa: "カラヴァッジョ", nameEn: "Caravaggio", born: 1571, died: 1610, pdYear: 1610, styleId: "baroque", nationality: "Italian", keywords: ["merisi"], promptHint: "extreme tenebrism, black ground, one hard raking light, unidealised naturalism" },
  { id: "rembrandt", nameJa: "レンブラント", nameEn: "Rembrandt van Rijn", born: 1606, died: 1669, pdYear: 1669, styleId: "baroque", nationality: "Dutch", keywords: ["rijn", "van rijn"], promptHint: "golden inner glow emerging from deep brown shadow, loaded impasto in lights, profound quiet" },
  { id: "vermeer", nameJa: "フェルメール", nameEn: "Johannes Vermeer", born: 1632, died: 1675, pdYear: 1675, styleId: "baroque", nationality: "Dutch", keywords: ["johannes", "delft"], promptHint: "cool northern window light from the left, pointille highlights, ultramarine and lemon yellow, still calm" },
  { id: "velazquez", nameJa: "ベラスケス", nameEn: "Diego Velazquez", born: 1599, died: 1660, pdYear: 1660, styleId: "baroque", nationality: "Spanish", keywords: ["diego", "velasquez"], promptHint: "fluid economical brushwork, silvery grey atmosphere, effortless optical truth" },
  { id: "elGreco", nameJa: "エル・グレコ", nameEn: "El Greco", born: 1541, died: 1614, pdYear: 1614, styleId: "baroque", nationality: "Spanish", keywords: ["greco", "theotokopoulos"], promptHint: "elongated attenuated forms, cold acid green and violet, flickering visionary light" },

  // ── ロマン主義／新古典 ─────────────────────────────────────────────────
  { id: "goya", nameJa: "ゴヤ", nameEn: "Francisco Goya", born: 1746, died: 1828, pdYear: 1828, styleId: "romanticism", nationality: "Spanish", keywords: ["francisco"], promptHint: "sombre earth and black, raw expressive handling, unsettling psychological weight" },
  { id: "delacroix", nameJa: "ドラクロワ", nameEn: "Eugene Delacroix", born: 1798, died: 1863, pdYear: 1863, styleId: "romanticism", nationality: "French", keywords: ["eugene"], promptHint: "vehement colour, sweeping diagonal movement, vibrating complementary contrasts" },
  { id: "turner", nameJa: "ターナー", nameEn: "J. M. W. Turner", born: 1775, died: 1851, pdYear: 1851, styleId: "romanticism", nationality: "British", keywords: ["jmw", "william turner"], promptHint: "form dissolved into luminous atmosphere, blazing whites and golds, veils of scumbled light" },
  { id: "constable", nameJa: "コンスタブル", nameEn: "John Constable", born: 1776, died: 1837, pdYear: 1837, styleId: "romanticism", nationality: "British", keywords: ["john"], promptHint: "fresh green landscape, broken white highlights, moving cloud and shifting daylight" },
  { id: "friedrich", nameJa: "カスパー・ダーヴィト・フリードリヒ", nameEn: "Caspar David Friedrich", born: 1774, died: 1840, pdYear: 1840, styleId: "romanticism", nationality: "German", keywords: ["caspar", "david friedrich"], promptHint: "vast silent space, solitary silhouette against luminous haze, cold sublime stillness" },
  { id: "blake", nameJa: "ウィリアム・ブレイク", nameEn: "William Blake", born: 1757, died: 1827, pdYear: 1827, styleId: "romanticism", nationality: "British", keywords: ["william"], promptHint: "visionary linear figures, watercolour over engraved outline, radiant symbolic light" },

  // ── 写実主義／バルビゾン ────────────────────────────────────────────────
  { id: "courbet", nameJa: "クールベ", nameEn: "Gustave Courbet", born: 1819, died: 1877, pdYear: 1877, styleId: "realism", nationality: "French", keywords: ["gustave"], promptHint: "palette-knife density, dark tonal ground, blunt material presence" },
  { id: "millet", nameJa: "ミレー", nameEn: "Jean-Francois Millet", born: 1814, died: 1875, pdYear: 1875, styleId: "realism", nationality: "French", keywords: ["jean francois"], promptHint: "grave monumental peasant forms, dusty golden light, muted earth tones" },
  { id: "repin", nameJa: "レーピン", nameEn: "Ilya Repin", born: 1844, died: 1930, pdYear: 1930, styleId: "realism", nationality: "Russian", keywords: ["ilya"], promptHint: "vigorous psychological realism, robust brushwork, sober russian palette" },
  { id: "aivazovsky", nameJa: "アイヴァゾフスキー", nameEn: "Ivan Aivazovsky", born: 1817, died: 1900, pdYear: 1900, styleId: "realism", nationality: "Russian", keywords: ["ivan", "aivazovski"], promptHint: "translucent luminous water, dramatic marine light, glowing transparent glazes" },

  // ── 印象派 ────────────────────────────────────────────────────────────
  { id: "monet", nameJa: "クロード・モネ", nameEn: "Claude Monet", born: 1840, died: 1926, pdYear: 1926, styleId: "impressionism", nationality: "French", keywords: ["claude"], promptHint: "dissolving atmospheric colour, repeated short strokes, violet and blue shadows, shimmering light" },
  { id: "renoir", nameJa: "ルノワール", nameEn: "Pierre-Auguste Renoir", born: 1841, died: 1919, pdYear: 1919, styleId: "impressionism", nationality: "French", keywords: ["auguste", "pierre"], promptHint: "warm rosy flesh tones, feathery soft touch, dappled sunlight" },
  { id: "degas", nameJa: "ドガ", nameEn: "Edgar Degas", born: 1834, died: 1917, pdYear: 1917, styleId: "impressionism", nationality: "French", keywords: ["edgar"], promptHint: "unexpected cropped viewpoint, pastel hatching, artificial stage light" },
  { id: "manet", nameJa: "マネ", nameEn: "Edouard Manet", born: 1832, died: 1883, pdYear: 1883, styleId: "impressionism", nationality: "French", keywords: ["edouard"], promptHint: "flattened tonal masses, frank black, crisp economical brushwork" },
  { id: "pissarro", nameJa: "ピサロ", nameEn: "Camille Pissarro", born: 1830, died: 1903, pdYear: 1903, styleId: "impressionism", nationality: "French", keywords: ["camille"], promptHint: "dense woven small strokes, humble rural motif, silvery diffused light" },
  { id: "sisley", nameJa: "シスレー", nameEn: "Alfred Sisley", born: 1839, died: 1899, pdYear: 1899, styleId: "impressionism", nationality: "French", keywords: ["alfred"], promptHint: "wide luminous sky, delicate tonal harmony, quiet river light" },
  { id: "morisot", nameJa: "ベルト・モリゾ", nameEn: "Berthe Morisot", born: 1841, died: 1895, pdYear: 1895, styleId: "impressionism", nationality: "French", keywords: ["berthe"], promptHint: "rapid open brushwork, pale airy palette, unfinished breathing edges" },
  { id: "cassatt", nameJa: "メアリー・カサット", nameEn: "Mary Cassatt", born: 1844, died: 1926, pdYear: 1926, styleId: "impressionism", nationality: "American", keywords: ["mary"], promptHint: "tender intimate framing, japanese-influenced flat pattern, soft pastel colour" },

  // ── 後期印象派／点描 ───────────────────────────────────────────────────
  { id: "vanGogh", nameJa: "フィンセント・ファン・ゴッホ", nameEn: "Vincent van Gogh", born: 1853, died: 1890, pdYear: 1890, styleId: "postImpressionism", nationality: "Dutch", keywords: ["gogh", "vincent", "van gogh"], promptHint: "thick swirling directional impasto, intense chrome yellow and cobalt, pulsating rhythmic strokes" },
  { id: "cezanne", nameJa: "セザンヌ", nameEn: "Paul Cezanne", born: 1839, died: 1906, pdYear: 1906, styleId: "postImpressionism", nationality: "French", keywords: ["paul"], promptHint: "constructive planar patches, tilted shifting perspective, cool green and ochre modulation" },
  { id: "gauguin", nameJa: "ゴーギャン", nameEn: "Paul Gauguin", born: 1848, died: 1903, pdYear: 1903, styleId: "postImpressionism", nationality: "French", keywords: ["paul"], promptHint: "flat cloisonne colour fields, bold dark contour, symbolic non-naturalistic hue" },
  { id: "seurat", nameJa: "スーラ", nameEn: "Georges Seurat", born: 1859, died: 1891, pdYear: 1891, styleId: "postImpressionism", nationality: "French", keywords: ["georges", "pointillism"], promptHint: "systematic pointillist dots of pure pigment, still monumental calm, luminous optical blend" },
  { id: "signac", nameJa: "シニャック", nameEn: "Paul Signac", born: 1863, died: 1935, pdYear: 1935, styleId: "postImpressionism", nationality: "French", keywords: ["paul", "divisionism"], promptHint: "large mosaic-like divisionist tesserae, brilliant saturated harbour colour" },
  { id: "toulouseLautrec", nameJa: "ロートレック", nameEn: "Henri de Toulouse-Lautrec", born: 1864, died: 1901, pdYear: 1901, styleId: "postImpressionism", nationality: "French", keywords: ["henri", "lautrec", "toulouse"], promptHint: "poster-like flat silhouette, sweeping calligraphic line, acid artificial light" },

  // ── 象徴主義／世紀末 ───────────────────────────────────────────────────
  { id: "klimt", nameJa: "クリムト", nameEn: "Gustav Klimt", born: 1862, died: 1918, pdYear: 1918, styleId: "symbolism", nationality: "Austrian", keywords: ["gustav"], promptHint: "gold leaf ornament, mosaic-like decorative pattern against naturalistic passages, byzantine richness" },
  { id: "schiele", nameJa: "エゴン・シーレ", nameEn: "Egon Schiele", born: 1890, died: 1918, pdYear: 1918, styleId: "symbolism", nationality: "Austrian", keywords: ["egon"], promptHint: "raw angular contour, gaunt attenuated form, sparse bleached ground" },
  { id: "munch", nameJa: "ムンク", nameEn: "Edvard Munch", born: 1863, died: 1944, pdYear: 1944, styleId: "symbolism", nationality: "Norwegian", keywords: ["edvard"], promptHint: "undulating wave-like bands, anxious saturated colour, dissolving contour" },
  { id: "redon", nameJa: "ルドン", nameEn: "Odilon Redon", born: 1840, died: 1916, pdYear: 1916, styleId: "symbolism", nationality: "French", keywords: ["odilon"], promptHint: "dreamlike floating forms, luminous pastel bloom, mysterious dark noirs" },
  { id: "bocklin", nameJa: "ベックリン", nameEn: "Arnold Bocklin", born: 1827, died: 1901, pdYear: 1901, styleId: "symbolism", nationality: "Swiss", keywords: ["arnold", "boecklin"], promptHint: "sombre mythic stillness, dark cypress green, ominous theatrical light" },
  { id: "mucha", nameJa: "ミュシャ", nameEn: "Alphonse Mucha", born: 1860, died: 1939, pdYear: 1939, styleId: "symbolism", nationality: "Czech", keywords: ["alphonse", "alfons"], promptHint: "art nouveau whiplash line, decorative halo and border, pale pastel with ink outline" },
  { id: "beardsley", nameJa: "ビアズリー", nameEn: "Aubrey Beardsley", born: 1872, died: 1898, pdYear: 1898, styleId: "symbolism", nationality: "British", keywords: ["aubrey"], promptHint: "stark black and white, elegant sinuous line, large flat silhouettes, decadent ornament" },
  { id: "whistler", nameJa: "ホイッスラー", nameEn: "James McNeill Whistler", born: 1834, died: 1903, pdYear: 1903, styleId: "symbolism", nationality: "American", keywords: ["james", "mcneill"], promptHint: "tonal nocturne, narrow close-valued harmony, veiled atmospheric haze" },

  // ── 表現主義／青騎士 ───────────────────────────────────────────────────
  { id: "kandinsky", nameJa: "カンディンスキー", nameEn: "Wassily Kandinsky", born: 1866, died: 1944, pdYear: 1944, styleId: "expressionism", nationality: "Russian", keywords: ["wassily", "vasily"], promptHint: "musical floating abstraction, keen linear accents over colour fields, dynamic non-objective rhythm" },
  { id: "marc", nameJa: "フランツ・マルク", nameEn: "Franz Marc", born: 1880, died: 1916, pdYear: 1916, styleId: "expressionism", nationality: "German", keywords: ["franz"], promptHint: "symbolic primary colour, crystalline interlocking planes, animal forms fused with landscape" },
  { id: "macke", nameJa: "アウグスト・マッケ", nameEn: "August Macke", born: 1887, died: 1914, pdYear: 1914, styleId: "expressionism", nationality: "German", keywords: ["august"], promptHint: "luminous transparent colour planes, gentle geometry, sunlit clarity" },
  { id: "klee", nameJa: "パウル・クレー", nameEn: "Paul Klee", born: 1879, died: 1940, pdYear: 1940, styleId: "expressionism", nationality: "Swiss-German", keywords: ["paul"], promptHint: "child-like sign language, tessellated watercolour squares, delicate wandering line, poetic scale" },
  { id: "modigliani", nameJa: "モディリアーニ", nameEn: "Amedeo Modigliani", born: 1884, died: 1920, pdYear: 1920, styleId: "expressionism", nationality: "Italian", keywords: ["amedeo"], promptHint: "elongated simplified form, mask-like serenity, warm ochre ground, sinuous contour" },

  // ── キュビスム／未来派／構成主義 ─────────────────────────────────────────
  { id: "gris", nameJa: "フアン・グリス", nameEn: "Juan Gris", born: 1887, died: 1927, pdYear: 1927, styleId: "cubism", nationality: "Spanish", keywords: ["juan"], promptHint: "lucid architectonic cubist grid, crisp interlocking planes, controlled ochre blue and grey" },
  { id: "boccioni", nameJa: "ボッチョーニ", nameEn: "Umberto Boccioni", born: 1882, died: 1916, pdYear: 1916, styleId: "cubism", nationality: "Italian", keywords: ["umberto", "futurism"], promptHint: "force-lines of motion, fragmented dynamic sequence, radiating energy" },
  { id: "malevich", nameJa: "マレーヴィチ", nameEn: "Kazimir Malevich", born: 1879, died: 1935, pdYear: 1935, styleId: "cubism", nationality: "Russian", keywords: ["kazimir", "suprematism"], promptHint: "suprematist floating geometric elements on white void, pure flat colour, weightless diagonal" },

  // ── 抽象／デ・ステイル ─────────────────────────────────────────────────
  { id: "mondrian", nameJa: "モンドリアン", nameEn: "Piet Mondrian", born: 1872, died: 1944, pdYear: 1944, styleId: "abstract", nationality: "Dutch", keywords: ["piet", "de stijl"], promptHint: "orthogonal black grid, asymmetric rectangles of primary red blue yellow on white, absolute flatness" },
  { id: "afKlint", nameJa: "ヒルマ・アフ・クリント", nameEn: "Hilma af Klint", born: 1862, died: 1944, pdYear: 1944, styleId: "abstract", nationality: "Swedish", keywords: ["hilma", "klint"], promptHint: "diagrammatic spiritual abstraction, pale chalky pastel, concentric symbolic geometry" },

  // ── 素朴派／アメリカ絵画 ────────────────────────────────────────────────
  { id: "rousseau", nameJa: "アンリ・ルソー", nameEn: "Henri Rousseau", born: 1844, died: 1910, pdYear: 1910, styleId: "naive", nationality: "French", keywords: ["henri", "douanier"], promptHint: "naive frontal clarity, layered flat foliage, dreamlike stillness, deep saturated greens" },
  { id: "homer", nameJa: "ウィンスロー・ホーマー", nameEn: "Winslow Homer", born: 1836, died: 1910, pdYear: 1910, styleId: "naive", nationality: "American", keywords: ["winslow"], promptHint: "robust watercolour transparency, direct observation, strong value structure" },
  { id: "sargent", nameJa: "サージェント", nameEn: "John Singer Sargent", born: 1856, died: 1925, pdYear: 1925, styleId: "naive", nationality: "American", keywords: ["singer", "john"], promptHint: "bravura wet-in-wet brushwork, confident single-stroke form, luminous grey harmonies" },
  { id: "grantWood", nameJa: "グラント・ウッド", nameEn: "Grant Wood", born: 1891, died: 1942, pdYear: 1942, styleId: "naive", nationality: "American", keywords: ["grant", "regionalism"], promptHint: "smooth enamel surface, rounded stylised volumes, meticulous clarity, midwestern light" },

  // ── 浮世絵／日本画 ─────────────────────────────────────────────────────
  { id: "hokusai", nameJa: "葛飾北斎", nameEn: "Katsushika Hokusai", born: 1760, died: 1849, pdYear: 1849, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hokusai", "katsushika", "ほくさい", "かつしか"], promptHint: "bold prussian blue gradation, dynamic curving line, woodblock key-block outline, wave-like energy" },
  { id: "hiroshige", nameJa: "歌川広重", nameEn: "Utagawa Hiroshige", born: 1797, died: 1858, pdYear: 1858, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hiroshige", "utagawa", "ひろしげ"], promptHint: "poetic atmospheric landscape, bokashi colour gradation, dramatic foreground framing, weather and season" },
  { id: "utamaro", nameJa: "喜多川歌麿", nameEn: "Kitagawa Utamaro", born: 1753, died: 1806, pdYear: 1806, styleId: "ukiyoe", nationality: "Japanese", keywords: ["utamaro", "kitagawa", "うたまろ"], promptHint: "elegant elongated figures, fine hairline detail, mica ground, refined restrained palette" },
  { id: "sharaku", nameJa: "東洲斎写楽", nameEn: "Toshusai Sharaku", born: null, died: null, pdYear: 1795, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sharaku", "toshusai", "しゃらく"], promptHint: "exaggerated expressive caricature, dark mica ground, arresting frontal presence", note: "没年不詳。活動は1794–95年" },
  { id: "korin", nameJa: "尾形光琳", nameEn: "Ogata Korin", born: 1658, died: 1716, pdYear: 1716, styleId: "ukiyoe", nationality: "Japanese", keywords: ["korin", "ogata", "rinpa", "琳派", "こうりん"], promptHint: "rinpa decorative boldness, gold leaf ground, stylised natural motif, flat rhythmic arrangement" },
  { id: "sotatsu", nameJa: "俵屋宗達", nameEn: "Tawaraya Sotatsu", born: null, died: null, pdYear: 1640, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sotatsu", "tawaraya", "rinpa", "そうたつ"], promptHint: "tarashikomi pooled ink washes, gold ground, sweeping simplified silhouette", note: "没年不詳。1640年頃までの活動" },
  { id: "sesshu", nameJa: "雪舟", nameEn: "Sesshu Toyo", born: 1420, died: 1506, pdYear: 1506, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sesshu", "せっしゅう", "suibokuga"], promptHint: "monochrome ink wash, axe-cut brushstrokes, vast empty space, austere spiritual restraint" },
  { id: "tohaku", nameJa: "長谷川等伯", nameEn: "Hasegawa Tohaku", born: 1539, died: 1610, pdYear: 1610, styleId: "ukiyoe", nationality: "Japanese", keywords: ["tohaku", "hasegawa", "とうはく"], promptHint: "soft ink mist, forms emerging and vanishing in fog, profound quiet emptiness" },
  { id: "jakuchu", nameJa: "伊藤若冲", nameEn: "Ito Jakuchu", born: 1716, died: 1800, pdYear: 1800, styleId: "ukiyoe", nationality: "Japanese", keywords: ["jakuchu", "ito", "じゃくちゅう"], promptHint: "hypnotically dense ornamental detail, vivid mineral pigment, eccentric decorative pattern" },
  { id: "kurodaSeiki", nameJa: "黒田清輝", nameEn: "Kuroda Seiki", born: 1866, died: 1924, pdYear: 1924, styleId: "ukiyoe", nationality: "Japanese", keywords: ["kuroda", "seiki", "くろだ"], promptHint: "japanese plein-air impressionism, soft violet-tinged daylight, gentle academic modelling" },
  { id: "aokiShigeru", nameJa: "青木繁", nameEn: "Aoki Shigeru", born: 1882, died: 1911, pdYear: 1911, styleId: "ukiyoe", nationality: "Japanese", keywords: ["aoki", "shigeru", "あおき"], promptHint: "romantic mythic mood, deep resonant colour, lyrical romanticism" },
  { id: "hishidaShunso", nameJa: "菱田春草", nameEn: "Hishida Shunso", born: 1874, died: 1911, pdYear: 1911, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hishida", "shunso", "ひしだ", "moro-tai"], promptHint: "outline-less moro-tai technique, soft atmospheric colour veils, delicate nihonga pigment" },
];

export const PAINTER_BY_ID = new Map<string, Painter>(PAINTERS.map((p) => [p.id, p]));

/**
 * 部分一致検索。画家名（日英）・別名・国籍・様式 ID を対象にする。
 *
 * <p>本体の `TagExtractorDialog` に倣い、小文字化した `includes` で素朴に照合する。
 * 候補は 70 件程度なので、凝った索引は要らない。
 */
export function searchPainters(query: string, styleId?: StyleId): Painter[] {
  const pool = styleId ? PAINTERS.filter((p) => p.styleId === styleId) : PAINTERS;
  const q = query.trim().toLowerCase();
  if (!q) return pool;
  return pool.filter(
    (p) =>
      p.nameJa.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.styleId.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}
