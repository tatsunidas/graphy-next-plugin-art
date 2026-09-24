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
  /**
   * 代表作。**先頭がサムネイルの取得対象**になるので、最もよく知られた作品を先頭に置く。
   * `en` は `tools/fetch-thumbs.py` が Met / Wikimedia を検索するときの鍵になるため、
   * 通用している英題を入れること（直訳を作らない）。
   */
  works: { ja: string; en: string }[];
  /**
   * 作風の一言（日本語）。**選ぶ人に向けた文**で、{@link promptHint} とは役割が違う。
   * promptHint はモデルに渡す英語の指示で、人が読んで画家を選ぶ用途には向かない。
   */
  styleJa: string;
  /** プロンプトに差し込むこの画家固有の要点（英語）。 */
  promptHint: string;
  /** 没年が不詳な場合などの補足。UI に出す。 */
  note?: string;
}

export const PAINTERS: Painter[] = [
  // ── ルネサンス／初期フランドル ──────────────────────────────────────────
  {
    id: "leonardo", nameJa: "レオナルド・ダ・ヴィンチ", nameEn: "Leonardo da Vinci",
    born: 1452, died: 1519, pdYear: 1519,
    styleId: "renaissance", nationality: "Italian",
    keywords: ["davinci", "vinci"],
    works: [{ ja: "モナ・リザ", en: "Mona Lisa" }, { ja: "最後の晩餐", en: "The Last Supper" }],
    styleJa: "輪郭を溶かすスフマート。滑らかな陰影と確かな解剖",
    promptHint: "sfumato, smoky transitions with no hard outline, subtle anatomical structure, muted umber and olive",
  },
  {
    id: "michelangelo", nameJa: "ミケランジェロ", nameEn: "Michelangelo",
    born: 1475, died: 1564, pdYear: 1564,
    styleId: "renaissance", nationality: "Italian",
    keywords: ["buonarroti"],
    works: [{ ja: "アダムの創造", en: "The Creation of Adam" }, { ja: "最後の審判", en: "The Last Judgment" }],
    styleJa: "彫刻のような量感とねじれた肢体。フレスコの質感",
    promptHint: "monumental sculptural volume, powerful torsion, fresco surface, terracotta and cool blue",
  },
  {
    id: "raphael", nameJa: "ラファエロ", nameEn: "Raphael",
    born: 1483, died: 1520, pdYear: 1520,
    styleId: "renaissance", nationality: "Italian",
    keywords: ["raffaello", "sanzio"],
    works: [{ ja: "アテナイの学堂", en: "The School of Athens" }, { ja: "小椅子の聖母", en: "Madonna della Seggiola" }],
    styleJa: "均衡のとれた構図と澄んだ色。穏やかで安定した光",
    promptHint: "serene harmony, clear stable geometry, soft even light, limpid colour",
  },
  {
    id: "botticelli", nameJa: "ボッティチェリ", nameEn: "Sandro Botticelli",
    born: 1445, died: 1510, pdYear: 1510,
    styleId: "renaissance", nationality: "Italian",
    keywords: ["sandro"],
    works: [{ ja: "ヴィーナスの誕生", en: "The Birth of Venus" }, { ja: "プリマヴェーラ", en: "Primavera" }],
    styleJa: "流れる輪郭線と淡い肌。装飾的なリズム",
    promptHint: "flowing linear contour, pale luminous flesh, decorative rhythm, tempera delicacy",
  },
  {
    id: "vanEyck", nameJa: "ヤン・ファン・エイク", nameEn: "Jan van Eyck",
    born: 1390, died: 1441, pdYear: 1441,
    styleId: "renaissance", nationality: "Flemish",
    keywords: ["eyck", "van eyck"],
    works: [{ ja: "アルノルフィーニ夫妻像", en: "The Arnolfini Portrait" }, { ja: "ヘントの祭壇画", en: "The Ghent Altarpiece" }],
    styleJa: "顕微鏡のような細密描写。透明な油彩の層で宝石のような色",
    promptHint: "microscopic oil detail, deep translucent glazes, jewel-like saturated colour, meticulous texture",
  },
  {
    id: "durer", nameJa: "アルブレヒト・デューラー", nameEn: "Albrecht Durer",
    born: 1471, died: 1528, pdYear: 1528,
    styleId: "renaissance", nationality: "German",
    keywords: ["duerer", "durer", "albrecht"],
    works: [{ ja: "メランコリアI", en: "Melencolia I" }, { ja: "若い野兎", en: "Young Hare" }],
    styleJa: "版画のような精密さ。緻密な平行線の陰影",
    promptHint: "engraving-like precision, dense parallel hatching, austere northern detail",
  },
  {
    id: "bosch", nameJa: "ヒエロニムス・ボス", nameEn: "Hieronymus Bosch",
    born: 1450, died: 1516, pdYear: 1516,
    styleId: "renaissance", nationality: "Netherlandish",
    keywords: ["hieronymus"],
    works: [{ ja: "快楽の園", en: "The Garden of Earthly Delights" }, { ja: "乾草車", en: "The Haywain Triptych" }],
    styleJa: "幻想的な細部の増殖。淡く酸味のある色と夢のような不条理",
    promptHint: "fantastical proliferating detail, pale acid palette, dreamlike incongruity",
  },
  {
    id: "bruegel", nameJa: "ピーテル・ブリューゲル（父）", nameEn: "Pieter Bruegel the Elder",
    born: 1525, died: 1569, pdYear: 1569,
    styleId: "renaissance", nationality: "Flemish",
    keywords: ["brueghel", "pieter"],
    works: [{ ja: "バベルの塔", en: "The Tower of Babel" }, { ja: "雪中の狩人", en: "The Hunters in the Snow" }],
    styleJa: "高い視点の俯瞰。小さな人物が群れ、土っぽい緑と黄土",
    promptHint: "high panoramic viewpoint, teeming small figures, earthy green and ochre, wintry light",
  },
  // ── バロック／マニエリスム ──────────────────────────────────────────────
  {
    id: "caravaggio", nameJa: "カラヴァッジョ", nameEn: "Caravaggio",
    born: 1571, died: 1610, pdYear: 1610,
    styleId: "baroque", nationality: "Italian",
    keywords: ["merisi"],
    works: [{ ja: "ナルキッソス", en: "Narcissus" }, { ja: "聖マタイの召命", en: "The Calling of Saint Matthew" }],
    styleJa: "漆黒の闇から一条の光。極端な明暗で劇的に浮かぶ",
    promptHint: "extreme tenebrism, black ground, one hard raking light, unidealised naturalism",
  },
  {
    id: "rembrandt", nameJa: "レンブラント", nameEn: "Rembrandt van Rijn",
    born: 1606, died: 1669, pdYear: 1669,
    styleId: "baroque", nationality: "Dutch",
    keywords: ["rijn", "van rijn"],
    works: [{ ja: "夜警", en: "The Night Watch" }, { ja: "自画像", en: "Self-Portrait" }],
    styleJa: "深い褐色の闇から金色の光が滲む。厚塗りの明部",
    promptHint: "golden inner glow emerging from deep brown shadow, loaded impasto in lights, profound quiet",
  },
  {
    id: "vermeer", nameJa: "フェルメール", nameEn: "Johannes Vermeer",
    born: 1632, died: 1675, pdYear: 1675,
    styleId: "baroque", nationality: "Dutch",
    keywords: ["johannes", "delft"],
    works: [{ ja: "真珠の耳飾りの少女", en: "Girl with a Pearl Earring" }, { ja: "牛乳を注ぐ女", en: "The Milkmaid" }],
    styleJa: "左からの窓の光。静謐で、ウルトラマリンとレモン色が冴える",
    promptHint: "cool northern window light from the left, pointille highlights, ultramarine and lemon yellow, still calm",
  },
  {
    id: "velazquez", nameJa: "ベラスケス", nameEn: "Diego Velazquez",
    born: 1599, died: 1660, pdYear: 1660,
    styleId: "baroque", nationality: "Spanish",
    keywords: ["diego", "velasquez"],
    works: [{ ja: "ラス・メニーナス", en: "Las Meninas" }, { ja: "教皇インノケンティウス10世の肖像", en: "Portrait of Pope Innocent X" }],
    styleJa: "流れるような筆致と銀灰色の空気。無駄のない描写",
    promptHint: "fluid economical brushwork, silvery grey atmosphere, effortless optical truth",
  },
  {
    id: "elGreco", nameJa: "エル・グレコ", nameEn: "El Greco",
    born: 1541, died: 1614, pdYear: 1614,
    styleId: "baroque", nationality: "Spanish",
    keywords: ["greco", "theotokopoulos"],
    works: [{ ja: "オルガス伯の埋葬", en: "The Burial of the Count of Orgaz" }, { ja: "トレド風景", en: "View of Toledo" }],
    styleJa: "引き伸ばされた人体と冷たい緑・紫。揺らめく幻視的な光",
    promptHint: "elongated attenuated forms, cold acid green and violet, flickering visionary light",
  },
  // ── ロマン主義／新古典 ─────────────────────────────────────────────────
  {
    id: "goya", nameJa: "ゴヤ", nameEn: "Francisco Goya",
    born: 1746, died: 1828, pdYear: 1828,
    styleId: "romanticism", nationality: "Spanish",
    keywords: ["francisco"],
    works: [{ ja: "我が子を喰らうサトゥルヌス", en: "Saturn Devouring His Son" }, { ja: "1808年5月3日", en: "The Third of May 1808" }],
    styleJa: "暗い土色と黒。荒い筆致で不穏な重さ",
    promptHint: "sombre earth and black, raw expressive handling, unsettling psychological weight",
  },
  {
    id: "delacroix", nameJa: "ドラクロワ", nameEn: "Eugene Delacroix",
    born: 1798, died: 1863, pdYear: 1863,
    styleId: "romanticism", nationality: "French",
    keywords: ["eugene"],
    works: [{ ja: "民衆を導く自由の女神", en: "Liberty Leading the People" }, { ja: "キオス島の虐殺", en: "The Massacre at Chios" }],
    styleJa: "激しい色と斜めの動き。補色がぶつかって震える",
    promptHint: "vehement colour, sweeping diagonal movement, vibrating complementary contrasts",
  },
  {
    id: "turner", nameJa: "ターナー", nameEn: "J. M. W. Turner",
    born: 1775, died: 1851, pdYear: 1851,
    styleId: "romanticism", nationality: "British",
    keywords: ["jmw", "william turner"],
    works: [{ ja: "雨、蒸気、速度", en: "Rain, Steam and Speed" }, { ja: "戦艦テメレール号", en: "The Fighting Temeraire" }],
    styleJa: "形が光と大気に溶ける。白と金がまぶしく霞む",
    promptHint: "form dissolved into luminous atmosphere, blazing whites and golds, veils of scumbled light",
  },
  {
    id: "constable", nameJa: "コンスタブル", nameEn: "John Constable",
    born: 1776, died: 1837, pdYear: 1837,
    styleId: "romanticism", nationality: "British",
    keywords: ["john"],
    works: [{ ja: "干草車", en: "The Hay Wain" }, { ja: "フラットフォードの製粉所", en: "Flatford Mill" }],
    styleJa: "みずみずしい緑の風景。白い光の斑と動く雲",
    promptHint: "fresh green landscape, broken white highlights, moving cloud and shifting daylight",
  },
  {
    id: "friedrich", nameJa: "カスパー・ダーヴィト・フリードリヒ", nameEn: "Caspar David Friedrich",
    born: 1774, died: 1840, pdYear: 1840,
    styleId: "romanticism", nationality: "German",
    keywords: ["caspar", "david friedrich"],
    works: [{ ja: "雲海の上の旅人", en: "Wanderer above the Sea of Fog" }, { ja: "氷の海", en: "The Sea of Ice" }],
    styleJa: "広大な静寂。霞を背にした孤独な影。冷たく崇高",
    promptHint: "vast silent space, solitary silhouette against luminous haze, cold sublime stillness",
  },
  {
    id: "blake", nameJa: "ウィリアム・ブレイク", nameEn: "William Blake",
    born: 1757, died: 1827, pdYear: 1827,
    styleId: "romanticism", nationality: "British",
    keywords: ["william"],
    works: [{ ja: "日の老いたる者", en: "The Ancient of Days" }, { ja: "巨大な赤い竜", en: "The Great Red Dragon" }],
    styleJa: "線で描く幻視。版刻の輪郭に水彩と象徴的な光",
    promptHint: "visionary linear figures, watercolour over engraved outline, radiant symbolic light",
  },
  // ── 写実主義／バルビゾン ────────────────────────────────────────────────
  {
    id: "courbet", nameJa: "クールベ", nameEn: "Gustave Courbet",
    born: 1819, died: 1877, pdYear: 1877,
    styleId: "realism", nationality: "French",
    keywords: ["gustave"],
    works: [{ ja: "オルナンの埋葬", en: "A Burial at Ornans" }, { ja: "画家のアトリエ", en: "The Painter's Studio" }],
    styleJa: "ペインティングナイフの厚み。暗い地に物質感のある描写",
    promptHint: "palette-knife density, dark tonal ground, blunt material presence",
  },
  {
    id: "millet", nameJa: "ミレー", nameEn: "Jean-Francois Millet",
    born: 1814, died: 1875, pdYear: 1875,
    styleId: "realism", nationality: "French",
    keywords: ["jean francois"],
    works: [{ ja: "落穂拾い", en: "The Gleaners" }, { ja: "晩鐘", en: "The Angelus" }],
    styleJa: "重々しい農民の姿。埃っぽい金色の光と抑えた土色",
    promptHint: "grave monumental peasant forms, dusty golden light, muted earth tones",
  },
  {
    id: "repin", nameJa: "レーピン", nameEn: "Ilya Repin",
    born: 1844, died: 1930, pdYear: 1930,
    styleId: "realism", nationality: "Russian",
    keywords: ["ilya"],
    works: [{ ja: "ヴォルガの舟曳き", en: "Barge Haulers on the Volga" }, { ja: "イヴァン雷帝とその息子", en: "Ivan the Terrible and His Son" }],
    styleJa: "力強い心理描写。骨太の筆致と沈んだ色調",
    promptHint: "vigorous psychological realism, robust brushwork, sober russian palette",
  },
  {
    id: "aivazovsky", nameJa: "アイヴァゾフスキー", nameEn: "Ivan Aivazovsky",
    born: 1817, died: 1900, pdYear: 1900,
    styleId: "realism", nationality: "Russian",
    keywords: ["ivan", "aivazovski"],
    works: [{ ja: "第九の波", en: "The Ninth Wave" }, { ja: "黒海", en: "The Black Sea" }],
    styleJa: "透きとおる水と劇的な海の光。輝く透明な層",
    promptHint: "translucent luminous water, dramatic marine light, glowing transparent glazes",
  },
  // ── 印象派 ────────────────────────────────────────────────────────────
  {
    id: "monet", nameJa: "クロード・モネ", nameEn: "Claude Monet",
    born: 1840, died: 1926, pdYear: 1926,
    styleId: "impressionism", nationality: "French",
    keywords: ["claude"],
    works: [{ ja: "印象・日の出", en: "Impression, Sunrise" }, { ja: "睡蓮", en: "Water Lilies" }],
    styleJa: "短い筆触で溶ける大気。影が青や紫で、光がきらめく",
    promptHint: "dissolving atmospheric colour, repeated short strokes, violet and blue shadows, shimmering light",
  },
  {
    id: "renoir", nameJa: "ルノワール", nameEn: "Pierre-Auguste Renoir",
    born: 1841, died: 1919, pdYear: 1919,
    styleId: "impressionism", nationality: "French",
    keywords: ["auguste", "pierre"],
    works: [{ ja: "ムーラン・ド・ラ・ギャレットの舞踏会", en: "Bal du moulin de la Galette" }, { ja: "舟遊びの人々の昼食", en: "Luncheon of the Boating Party" }],
    styleJa: "ばら色の肌と柔らかな筆。木漏れ日のような光",
    promptHint: "warm rosy flesh tones, feathery soft touch, dappled sunlight",
  },
  {
    id: "degas", nameJa: "ドガ", nameEn: "Edgar Degas",
    born: 1834, died: 1917, pdYear: 1917,
    styleId: "impressionism", nationality: "French",
    keywords: ["edgar"],
    works: [{ ja: "エトワール", en: "The Star" }, { ja: "踊りの稽古場", en: "The Dance Class" }],
    styleJa: "思いがけない切り取り方。パステルの線と舞台の人工光",
    promptHint: "unexpected cropped viewpoint, pastel hatching, artificial stage light",
  },
  {
    id: "manet", nameJa: "マネ", nameEn: "Edouard Manet",
    born: 1832, died: 1883, pdYear: 1883,
    styleId: "impressionism", nationality: "French",
    keywords: ["edouard"],
    works: [{ ja: "草上の昼食", en: "Le Dejeuner sur l'herbe" }, { ja: "オランピア", en: "Olympia" }],
    styleJa: "平坦な色の塊と率直な黒。簡潔で切れのいい筆",
    promptHint: "flattened tonal masses, frank black, crisp economical brushwork",
  },
  {
    id: "pissarro", nameJa: "ピサロ", nameEn: "Camille Pissarro",
    born: 1830, died: 1903, pdYear: 1903,
    styleId: "impressionism", nationality: "French",
    keywords: ["camille"],
    works: [{ ja: "モンマルトル大通り", en: "Boulevard Montmartre" }, { ja: "赤い屋根", en: "The Red Roofs" }],
    styleJa: "細かな筆触を織るように重ねる。銀色に拡散した光",
    promptHint: "dense woven small strokes, humble rural motif, silvery diffused light",
  },
  {
    id: "sisley", nameJa: "シスレー", nameEn: "Alfred Sisley",
    born: 1839, died: 1899, pdYear: 1899,
    styleId: "impressionism", nationality: "French",
    keywords: ["alfred"],
    works: [{ ja: "ポール・マルリーの洪水", en: "Flood at Port-Marly" }, { ja: "モレのポプラ並木", en: "Poplar Avenue at Moret" }],
    styleJa: "広い空と穏やかな階調。静かな水辺の光",
    promptHint: "wide luminous sky, delicate tonal harmony, quiet river light",
  },
  {
    id: "morisot", nameJa: "ベルト・モリゾ", nameEn: "Berthe Morisot",
    born: 1841, died: 1895, pdYear: 1895,
    styleId: "impressionism", nationality: "French",
    keywords: ["berthe"],
    works: [{ ja: "ゆりかご", en: "The Cradle" }, { ja: "夏の日", en: "Summer's Day" }],
    styleJa: "素早く開いた筆致。淡く軽やかで輪郭を残さない",
    promptHint: "rapid open brushwork, pale airy palette, unfinished breathing edges",
  },
  {
    id: "cassatt", nameJa: "メアリー・カサット", nameEn: "Mary Cassatt",
    born: 1844, died: 1926, pdYear: 1926,
    styleId: "impressionism", nationality: "American",
    keywords: ["mary"],
    works: [{ ja: "舟遊び", en: "The Boating Party" }, { ja: "母と子", en: "Mother and Child" }],
    styleJa: "親密な切り取り。浮世絵ふうの平らな模様と淡い色",
    promptHint: "tender intimate framing, japanese-influenced flat pattern, soft pastel colour",
  },
  // ── 後期印象派／点描 ───────────────────────────────────────────────────
  {
    id: "vanGogh", nameJa: "フィンセント・ファン・ゴッホ", nameEn: "Vincent van Gogh",
    born: 1853, died: 1890, pdYear: 1890,
    styleId: "postImpressionism", nationality: "Dutch",
    keywords: ["gogh", "vincent", "van gogh"],
    works: [{ ja: "星月夜", en: "The Starry Night" }, { ja: "ひまわり", en: "Sunflowers" }],
    styleJa: "渦を巻く厚塗り。クロムイエローとコバルトが脈打つ",
    promptHint: "thick swirling directional impasto, intense chrome yellow and cobalt, pulsating rhythmic strokes",
  },
  {
    id: "cezanne", nameJa: "セザンヌ", nameEn: "Paul Cezanne",
    born: 1839, died: 1906, pdYear: 1906,
    styleId: "postImpressionism", nationality: "French",
    keywords: ["paul"],
    works: [{ ja: "サント・ヴィクトワール山", en: "Mont Sainte-Victoire" }, { ja: "林檎とオレンジ", en: "Apples and Oranges" }],
    styleJa: "面で構築する筆触。視点がずれ、緑と黄土が層になる",
    promptHint: "constructive planar patches, tilted shifting perspective, cool green and ochre modulation",
  },
  {
    id: "gauguin", nameJa: "ゴーギャン", nameEn: "Paul Gauguin",
    born: 1848, died: 1903, pdYear: 1903,
    styleId: "postImpressionism", nationality: "French",
    keywords: ["paul"],
    works: [{ ja: "我々はどこから来たのか", en: "Where Do We Come From? What Are We? Where Are We Going?" }, { ja: "タヒチの女たち", en: "Tahitian Women on the Beach" }],
    styleJa: "平らな色面を濃い輪郭で囲う。象徴的で自然を離れた色",
    promptHint: "flat cloisonne colour fields, bold dark contour, symbolic non-naturalistic hue",
  },
  {
    id: "seurat", nameJa: "スーラ", nameEn: "Georges Seurat",
    born: 1859, died: 1891, pdYear: 1891,
    styleId: "postImpressionism", nationality: "French",
    keywords: ["georges", "pointillism"],
    works: [{ ja: "グランド・ジャット島の日曜日の午後", en: "A Sunday on La Grande Jatte" }, { ja: "アニエールの水浴", en: "Bathers at Asnieres" }],
    styleJa: "純色の点を規則的に並べる。静かで記念碑的な佇まい",
    promptHint: "systematic pointillist dots of pure pigment, still monumental calm, luminous optical blend",
  },
  {
    id: "signac", nameJa: "シニャック", nameEn: "Paul Signac",
    born: 1863, died: 1935, pdYear: 1935,
    styleId: "postImpressionism", nationality: "French",
    keywords: ["paul", "divisionism"],
    works: [{ ja: "赤い浮標", en: "The Red Buoy" }, { ja: "サン・トロペの港", en: "The Port of Saint-Tropez" }],
    styleJa: "モザイクのような大きな色片。港の色が鮮烈に輝く",
    promptHint: "large mosaic-like divisionist tesserae, brilliant saturated harbour colour",
  },
  {
    id: "toulouseLautrec", nameJa: "ロートレック", nameEn: "Henri de Toulouse-Lautrec",
    born: 1864, died: 1901, pdYear: 1901,
    styleId: "postImpressionism", nationality: "French",
    keywords: ["henri", "lautrec", "toulouse"],
    works: [{ ja: "ムーラン・ルージュにて", en: "At the Moulin Rouge" }, { ja: "ジャヌ・アヴリル", en: "Jane Avril" }],
    styleJa: "ポスターのような平らな影。大胆な線と人工光の酸味",
    promptHint: "poster-like flat silhouette, sweeping calligraphic line, acid artificial light",
  },
  // ── 象徴主義／世紀末 ───────────────────────────────────────────────────
  {
    id: "klimt", nameJa: "クリムト", nameEn: "Gustav Klimt",
    born: 1862, died: 1918, pdYear: 1918,
    styleId: "symbolism", nationality: "Austrian",
    keywords: ["gustav"],
    works: [{ ja: "接吻", en: "The Kiss" }, { ja: "アデーレ・ブロッホ＝バウアーの肖像", en: "Portrait of Adele Bloch-Bauer I" }],
    styleJa: "金箔の装飾とモザイク状の文様。写実の部分と対比する",
    promptHint: "gold leaf ornament, mosaic-like decorative pattern against naturalistic passages, byzantine richness",
  },
  {
    id: "schiele", nameJa: "エゴン・シーレ", nameEn: "Egon Schiele",
    born: 1890, died: 1918, pdYear: 1918,
    styleId: "symbolism", nationality: "Austrian",
    keywords: ["egon"],
    works: [{ ja: "抱擁", en: "The Embrace" }, { ja: "死と乙女", en: "Death and the Maiden" }],
    styleJa: "荒く角ばった輪郭。痩せて引き伸ばされた体と素地",
    promptHint: "raw angular contour, gaunt attenuated form, sparse bleached ground",
  },
  {
    id: "munch", nameJa: "ムンク", nameEn: "Edvard Munch",
    born: 1863, died: 1944, pdYear: 1944,
    styleId: "symbolism", nationality: "Norwegian",
    keywords: ["edvard"],
    works: [{ ja: "叫び", en: "The Scream" }, { ja: "マドンナ", en: "Madonna" }],
    styleJa: "うねる帯状の筆。不安を帯びた強い色で輪郭が溶ける",
    promptHint: "undulating wave-like bands, anxious saturated colour, dissolving contour",
  },
  {
    id: "redon", nameJa: "ルドン", nameEn: "Odilon Redon",
    born: 1840, died: 1916, pdYear: 1916,
    styleId: "symbolism", nationality: "French",
    keywords: ["odilon"],
    works: [{ ja: "キュクロプス", en: "The Cyclops" }, { ja: "眼=気球", en: "The Eye Like a Strange Balloon" }],
    styleJa: "夢のように浮かぶ形。パステルの淡い発光と黒の神秘",
    promptHint: "dreamlike floating forms, luminous pastel bloom, mysterious dark noirs",
  },
  {
    id: "bocklin", nameJa: "ベックリン", nameEn: "Arnold Bocklin",
    born: 1827, died: 1901, pdYear: 1901,
    styleId: "symbolism", nationality: "Swiss",
    keywords: ["arnold", "boecklin"],
    works: [{ ja: "死の島", en: "Isle of the Dead" }, { ja: "ケンタウロスの闘い", en: "Battle of the Centaurs" }],
    styleJa: "沈んだ神話的な静けさ。糸杉の暗緑と不吉な光",
    promptHint: "sombre mythic stillness, dark cypress green, ominous theatrical light",
  },
  {
    id: "mucha", nameJa: "ミュシャ", nameEn: "Alphonse Mucha",
    born: 1860, died: 1939, pdYear: 1939,
    styleId: "symbolism", nationality: "Czech",
    keywords: ["alphonse", "alfons"],
    works: [{ ja: "ジスモンダ", en: "Gismonda" }, { ja: "四季", en: "The Seasons" }],
    styleJa: "アール・ヌーヴォーの曲線。装飾的な枠と淡い色に輪郭線",
    promptHint: "art nouveau whiplash line, decorative halo and border, pale pastel with ink outline",
  },
  {
    id: "beardsley", nameJa: "ビアズリー", nameEn: "Aubrey Beardsley",
    born: 1872, died: 1898, pdYear: 1898,
    styleId: "symbolism", nationality: "British",
    keywords: ["aubrey"],
    works: [{ ja: "孔雀の裾", en: "The Peacock Skirt" }, { ja: "サロメ", en: "Salome" }],
    styleJa: "白黒だけ。優美な曲線と大きな平面の影。退廃的な装飾",
    promptHint: "stark black and white, elegant sinuous line, large flat silhouettes, decadent ornament",
  },
  {
    id: "whistler", nameJa: "ホイッスラー", nameEn: "James McNeill Whistler",
    born: 1834, died: 1903, pdYear: 1903,
    styleId: "symbolism", nationality: "American",
    keywords: ["james", "mcneill"],
    works: [{ ja: "黒と金のノクターン", en: "Nocturne in Black and Gold" }, { ja: "灰色と黒のアレンジメント", en: "Arrangement in Grey and Black No.1" }],
    styleJa: "夜想曲のような階調。近い明度でまとめた霞んだ空気",
    promptHint: "tonal nocturne, narrow close-valued harmony, veiled atmospheric haze",
  },
  // ── 表現主義／青騎士 ───────────────────────────────────────────────────
  {
    id: "kandinsky", nameJa: "カンディンスキー", nameEn: "Wassily Kandinsky",
    born: 1866, died: 1944, pdYear: 1944,
    styleId: "expressionism", nationality: "Russian",
    keywords: ["wassily", "vasily"],
    works: [{ ja: "コンポジションVIII", en: "Composition VIII" }, { ja: "黄・赤・青", en: "Yellow-Red-Blue" }],
    styleJa: "音楽のように漂う抽象。色面の上を鋭い線が走る",
    promptHint: "musical floating abstraction, keen linear accents over colour fields, dynamic non-objective rhythm",
  },
  {
    id: "marc", nameJa: "フランツ・マルク", nameEn: "Franz Marc",
    born: 1880, died: 1916, pdYear: 1916,
    styleId: "expressionism", nationality: "German",
    keywords: ["franz"],
    works: [{ ja: "青い馬I", en: "Blue Horse I" }, { ja: "動物の運命", en: "Fate of the Animals" }],
    styleJa: "象徴としての原色。結晶のような面で動物と風景が溶け合う",
    promptHint: "symbolic primary colour, crystalline interlocking planes, animal forms fused with landscape",
  },
  {
    id: "macke", nameJa: "アウグスト・マッケ", nameEn: "August Macke",
    born: 1887, died: 1914, pdYear: 1914,
    styleId: "expressionism", nationality: "German",
    keywords: ["august"],
    works: [{ ja: "緑の上着の女", en: "Lady in a Green Jacket" }, { ja: "チュニスの市場", en: "Market in Tunis" }],
    styleJa: "透明な色面が明るく重なる。穏やかな幾何と陽光",
    promptHint: "luminous transparent colour planes, gentle geometry, sunlit clarity",
  },
  {
    id: "klee", nameJa: "パウル・クレー", nameEn: "Paul Klee",
    born: 1879, died: 1940, pdYear: 1940,
    styleId: "expressionism", nationality: "Swiss-German",
    keywords: ["paul"],
    works: [{ ja: "セネシオ", en: "Senecio" }, { ja: "さえずり機械", en: "Twittering Machine" }],
    styleJa: "子どものような記号。水彩の格子と迷うような細い線",
    promptHint: "child-like sign language, tessellated watercolour squares, delicate wandering line, poetic scale",
  },
  {
    id: "modigliani", nameJa: "モディリアーニ", nameEn: "Amedeo Modigliani",
    born: 1884, died: 1920, pdYear: 1920,
    styleId: "expressionism", nationality: "Italian",
    keywords: ["amedeo"],
    works: [{ ja: "横たわる裸婦", en: "Reclining Nude" }, { ja: "ジャンヌ・エビュテルヌの肖像", en: "Portrait of Jeanne Hebuterne" }],
    styleJa: "引き伸ばされた単純な形。仮面のような静けさと黄土の地",
    promptHint: "elongated simplified form, mask-like serenity, warm ochre ground, sinuous contour",
  },
  // ── キュビスム／未来派／構成主義 ─────────────────────────────────────────
  {
    id: "gris", nameJa: "フアン・グリス", nameEn: "Juan Gris",
    born: 1887, died: 1927, pdYear: 1927,
    styleId: "cubism", nationality: "Spanish",
    keywords: ["juan"],
    works: [{ ja: "ピカソの肖像", en: "Portrait of Pablo Picasso" }, { ja: "ギターと楽譜", en: "Guitar and Music Paper" }],
    styleJa: "明晰な幾何の格子。組み合う面と抑えた黄土・青・灰",
    promptHint: "lucid architectonic cubist grid, crisp interlocking planes, controlled ochre blue and grey",
  },
  {
    id: "boccioni", nameJa: "ボッチョーニ", nameEn: "Umberto Boccioni",
    born: 1882, died: 1916, pdYear: 1916,
    styleId: "cubism", nationality: "Italian",
    keywords: ["umberto", "futurism"],
    works: [{ ja: "空間における連続性の唯一の形態", en: "Unique Forms of Continuity in Space" }, { ja: "街は起ち上がる", en: "The City Rises" }],
    styleJa: "運動の力線。分割された連続像が放射する",
    promptHint: "force-lines of motion, fragmented dynamic sequence, radiating energy",
  },
  {
    id: "malevich", nameJa: "マレーヴィチ", nameEn: "Kazimir Malevich",
    born: 1879, died: 1935, pdYear: 1935,
    styleId: "cubism", nationality: "Russian",
    keywords: ["kazimir", "suprematism"],
    works: [{ ja: "黒の正方形", en: "Black Square" }, { ja: "白の上の白", en: "Suprematist Composition: White on White" }],
    styleJa: "白い虚空に浮く純粋な幾何。平らな色と無重力の斜め",
    promptHint: "suprematist floating geometric elements on white void, pure flat colour, weightless diagonal",
  },
  // ── 抽象／デ・ステイル ─────────────────────────────────────────────────
  {
    id: "mondrian", nameJa: "モンドリアン", nameEn: "Piet Mondrian",
    born: 1872, died: 1944, pdYear: 1944,
    styleId: "abstract", nationality: "Dutch",
    keywords: ["piet", "de stijl"],
    works: [{ ja: "赤・青・黄のコンポジション", en: "Composition with Red Blue and Yellow" }, { ja: "ブロードウェイ・ブギウギ", en: "Broadway Boogie Woogie" }],
    styleJa: "黒い直交格子と原色の矩形。完全に平面的",
    promptHint: "orthogonal black grid, asymmetric rectangles of primary red blue yellow on white, absolute flatness",
  },
  {
    id: "afKlint", nameJa: "ヒルマ・アフ・クリント", nameEn: "Hilma af Klint",
    born: 1862, died: 1944, pdYear: 1944,
    styleId: "abstract", nationality: "Swedish",
    keywords: ["hilma", "klint"],
    works: [{ ja: "10の最大物", en: "The Ten Largest" }, { ja: "祭壇画", en: "Altarpiece" }],
    styleJa: "図式的な精神性の抽象。白亜質の淡い色と同心の幾何",
    promptHint: "diagrammatic spiritual abstraction, pale chalky pastel, concentric symbolic geometry",
  },
  // ── 素朴派／アメリカ絵画 ────────────────────────────────────────────────
  {
    id: "rousseau", nameJa: "アンリ・ルソー", nameEn: "Henri Rousseau",
    born: 1844, died: 1910, pdYear: 1910,
    styleId: "naive", nationality: "French",
    keywords: ["henri", "douanier"],
    works: [{ ja: "夢", en: "The Dream" }, { ja: "眠るジプシー女", en: "The Sleeping Gypsy" }],
    styleJa: "正面からの素朴な明快さ。重なる平らな葉と夢のような静止",
    promptHint: "naive frontal clarity, layered flat foliage, dreamlike stillness, deep saturated greens",
  },
  {
    id: "homer", nameJa: "ウィンスロー・ホーマー", nameEn: "Winslow Homer",
    born: 1836, died: 1910, pdYear: 1910,
    styleId: "naive", nationality: "American",
    keywords: ["winslow"],
    works: [{ ja: "メキシコ湾流", en: "The Gulf Stream" }, { ja: "北東風", en: "Northeaster" }],
    styleJa: "力強い水彩の透明感。直接の観察と明快な明暗",
    promptHint: "robust watercolour transparency, direct observation, strong value structure",
  },
  {
    id: "sargent", nameJa: "サージェント", nameEn: "John Singer Sargent",
    born: 1856, died: 1925, pdYear: 1925,
    styleId: "naive", nationality: "American",
    keywords: ["singer", "john"],
    works: [{ ja: "マダムX", en: "Madame X" }, { ja: "カーネーション、リリー、リリー、ローズ", en: "Carnation, Lily, Lily, Rose" }],
    styleJa: "一筆で形を決める鮮やかな筆さばき。輝く灰色の調和",
    promptHint: "bravura wet-in-wet brushwork, confident single-stroke form, luminous grey harmonies",
  },
  {
    id: "grantWood", nameJa: "グラント・ウッド", nameEn: "Grant Wood",
    born: 1891, died: 1942, pdYear: 1942,
    styleId: "naive", nationality: "American",
    keywords: ["grant", "regionalism"],
    works: [{ ja: "アメリカン・ゴシック", en: "American Gothic" }, { ja: "ポール・リビアの疾走", en: "The Midnight Ride of Paul Revere" }],
    styleJa: "滑らかな琺瑯のような表面。丸みのある形と克明な描写",
    promptHint: "smooth enamel surface, rounded stylised volumes, meticulous clarity, midwestern light",
  },
  // ── 浮世絵／日本画 ─────────────────────────────────────────────────────
  {
    id: "hokusai", nameJa: "葛飾北斎", nameEn: "Katsushika Hokusai",
    born: 1760, died: 1849, pdYear: 1849,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["hokusai", "katsushika", "ほくさい", "かつしか"],
    works: [{ ja: "神奈川沖浪裏", en: "Under the Wave off Kanagawa" }, { ja: "凱風快晴", en: "Fine Wind, Clear Morning" }],
    styleJa: "藍のぼかしと力強い曲線。木版の輪郭線がはっきり出る",
    promptHint: "bold prussian blue gradation, dynamic curving line, woodblock key-block outline, wave-like energy",
  },
  {
    id: "hiroshige", nameJa: "歌川広重", nameEn: "Utagawa Hiroshige",
    born: 1797, died: 1858, pdYear: 1858,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["hiroshige", "utagawa", "ひろしげ"],
    works: [{ ja: "大はしあたけの夕立", en: "Sudden Shower over Shin-Ohashi Bridge and Atake" }, { ja: "東海道五十三次", en: "Fifty-three Stations of the Tokaido" }],
    styleJa: "詩情のある風景とぼかし。手前を大きく切り取る構図",
    promptHint: "poetic atmospheric landscape, bokashi colour gradation, dramatic foreground framing, weather and season",
  },
  {
    id: "utamaro", nameJa: "喜多川歌麿", nameEn: "Kitagawa Utamaro",
    born: 1753, died: 1806, pdYear: 1806,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["utamaro", "kitagawa", "うたまろ"],
    works: [{ ja: "ポッピンを吹く娘", en: "Young Woman Blowing a Poppin" }, { ja: "寛政三美人", en: "Three Beauties of the Present Day" }],
    styleJa: "細くしなやかな人物と髪の細密。雲母摺りの抑えた色",
    promptHint: "elegant elongated figures, fine hairline detail, mica ground, refined restrained palette",
  },
  {
    id: "sharaku", nameJa: "東洲斎写楽", nameEn: "Toshusai Sharaku",
    born: null, died: null, pdYear: 1795,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["sharaku", "toshusai", "しゃらく"],
    works: [{ ja: "三代目大谷鬼次の江戸兵衛", en: "Otani Oniji III as Yakko Edobei" }, { ja: "市川蝦蔵の竹村定之進", en: "Ichikawa Ebizo as Takemura Sadanoshin" }],
    styleJa: "誇張された表情。雲母の暗い地に正面から迫る",
    promptHint: "exaggerated expressive caricature, dark mica ground, arresting frontal presence",
    note: "没年不詳。活動は1794–95年",
  },
  {
    id: "korin", nameJa: "尾形光琳", nameEn: "Ogata Korin",
    born: 1658, died: 1716, pdYear: 1716,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["korin", "ogata", "rinpa", "琳派", "こうりん"],
    works: [{ ja: "燕子花図屏風", en: "Irises" }, { ja: "紅白梅図屏風", en: "Red and White Plum Blossoms" }],
    styleJa: "琳派の大胆な装飾。金地に様式化した自然と平らなリズム",
    promptHint: "rinpa decorative boldness, gold leaf ground, stylised natural motif, flat rhythmic arrangement",
  },
  {
    id: "sotatsu", nameJa: "俵屋宗達", nameEn: "Tawaraya Sotatsu",
    born: null, died: null, pdYear: 1640,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["sotatsu", "tawaraya", "rinpa", "そうたつ"],
    works: [{ ja: "風神雷神図屏風", en: "Wind God and Thunder God" }, { ja: "舞楽図屏風", en: "Bugaku Dancers" }],
    styleJa: "たらし込みの滲み。金地に大きく簡潔な輪郭",
    promptHint: "tarashikomi pooled ink washes, gold ground, sweeping simplified silhouette",
    note: "没年不詳。1640年頃までの活動",
  },
  {
    id: "sesshu", nameJa: "雪舟", nameEn: "Sesshu Toyo",
    born: 1420, died: 1506, pdYear: 1506,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["sesshu", "せっしゅう", "suibokuga"],
    works: [{ ja: "秋冬山水図", en: "Landscapes of Autumn and Winter" }, { ja: "慧可断臂図", en: "Huike Offering His Arm to Bodhidharma" }],
    styleJa: "水墨だけ。斧で断つような筆と広い余白、厳しい静けさ",
    promptHint: "monochrome ink wash, axe-cut brushstrokes, vast empty space, austere spiritual restraint",
  },
  {
    id: "tohaku", nameJa: "長谷川等伯", nameEn: "Hasegawa Tohaku",
    born: 1539, died: 1610, pdYear: 1610,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["tohaku", "hasegawa", "とうはく"],
    works: [{ ja: "松林図屏風", en: "Pine Trees" }, { ja: "楓図", en: "Maple Tree" }],
    styleJa: "霧に沈む墨。形が現れては消える深い静寂と余白",
    promptHint: "soft ink mist, forms emerging and vanishing in fog, profound quiet emptiness",
  },
  {
    id: "jakuchu", nameJa: "伊藤若冲", nameEn: "Ito Jakuchu",
    born: 1716, died: 1800, pdYear: 1800,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["jakuchu", "ito", "じゃくちゅう"],
    works: [{ ja: "群鶏図", en: "Rooster and Hens" }, { ja: "動植綵絵", en: "Colorful Realm of Living Beings" }],
    styleJa: "息詰まるほど密な装飾。鮮やかな岩絵具と奇矯な文様",
    promptHint: "hypnotically dense ornamental detail, vivid mineral pigment, eccentric decorative pattern",
  },
  {
    id: "kurodaSeiki", nameJa: "黒田清輝", nameEn: "Kuroda Seiki",
    born: 1866, died: 1924, pdYear: 1924,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["kuroda", "seiki", "くろだ"],
    works: [{ ja: "湖畔", en: "By the Lake" }, { ja: "舞妓", en: "Maiko Girl" }],
    styleJa: "日本の外光派。紫を帯びた柔らかな日差しと穏やかな陰影",
    promptHint: "japanese plein-air impressionism, soft violet-tinged daylight, gentle academic modelling",
  },
  {
    id: "aokiShigeru", nameJa: "青木繁", nameEn: "Aoki Shigeru",
    born: 1882, died: 1911, pdYear: 1911,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["aoki", "shigeru", "あおき"],
    works: [{ ja: "海の幸", en: "A Gift of the Sea" }, { ja: "わだつみのいろこの宮", en: "Paradise under the Sea" }],
    styleJa: "神話的で浪漫的な気配。深く響く色調",
    promptHint: "romantic mythic mood, deep resonant colour, lyrical romanticism",
  },
  {
    id: "hishidaShunso", nameJa: "菱田春草", nameEn: "Hishida Shunso",
    born: 1874, died: 1911, pdYear: 1911,
    styleId: "ukiyoe", nationality: "Japanese",
    keywords: ["hishida", "shunso", "ひしだ", "moro-tai"],
    works: [{ ja: "落葉", en: "Fallen Leaves" }, { ja: "黒き猫", en: "Black Cat" }],
    styleJa: "輪郭を用いない朦朧体。柔らかな色の層と繊細な岩絵具",
    promptHint: "outline-less moro-tai technique, soft atmospheric colour veils, delicate nihonga pigment",
  },
];

export const PAINTER_BY_ID = new Map<string, Painter>(PAINTERS.map((p) => [p.id, p]));

/**
 * 部分一致検索。画家名（日英）・別名・国籍・様式 ID・代表作名を対象にする。
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
      p.keywords.some((k) => k.toLowerCase().includes(q)) ||
      // 作品名からも辿れるようにする（「神奈川沖浪裏」で北斎に行き着ける）。
      p.works.some((w) => w.ja.toLowerCase().includes(q) || w.en.toLowerCase().includes(q)),
  );
}
