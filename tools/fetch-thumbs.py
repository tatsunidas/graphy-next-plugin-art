#!/usr/bin/env python3
"""
画家ごとの代表作サムネイルを取得して、`src/core/thumbs.ts` を作り直す。

    npm run thumbs

## なぜ埋め込むのか
プラグインが配信できるのは `plugin.json` と `ui.js` だけで（backend の
PluginController は `/{id}/ui.js` しか返さない）、しかも本体の CSP は
`img-src 'self' data: blob:` なので、実行時に外部から画像を引くこともできない。
そこで **取得は開発時の一度きり**にして、base64 の data URI として ui.js に
焼き込む。配布物は自己完結し、実行時にネットワークへ出ない。

## 守っていること
🔴 **パブリックドメインと確認できた画像しか採らない。**
   MIT のリポジトリに CC BY-SA の写真を焼き込まない。ライセンス表記が
   取れない候補は捨てて次の候補へ行く。
🔴 **見つからなければ空のまま残す。** それらしい別の絵で埋めない。
   取れなかった画家は最後に一覧で出すので、手で curate できる。
🔴 **出所を必ず記録する。** PD でも来歴は辿れるようにし、
   `THIRD-PARTY-IMAGES.md` に画家・作品・出典・ライセンス・URL を残す。

## 出典
1. Met Museum Open Access — CC0。`isPublicDomain` フラグで確実に判定できる
2. Wikimedia Commons — `extmetadata.LicenseShortName` が PD / CC0 のものだけ
"""

from __future__ import annotations

import base64
import io
import json
import re
import subprocess
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
THUMBS_TS = ROOT / "src" / "core" / "thumbs.ts"
CREDITS_MD = ROOT / "THIRD-PARTY-IMAGES.md"

UA = "graphy-next-plugin-art/0.1 (+https://github.com/tatsunidas/graphy-next-plugin-art)"
TIMEOUT = 30

# 表示は 48px。高 DPI と将来の拡大を見越して倍の 96px で持つ。
THUMB_PX = 96
# 1 枚あたりの上限（base64 前のバイト数）。71 人ぶんで ui.js が膨らみすぎないように。
MAX_BYTES = 5000
# 上限に収まるまで落とす品質の段。
QUALITIES = [78, 70, 62, 54, 46]

# PD と見なすライセンス表記。ここに無いものは採らない。
PD_MARKERS = ("public domain", "pd-", "cc0", "no restrictions")


def log(msg: str) -> None:
    print(msg, flush=True)


def get_json(url: str) -> dict | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:  # noqa: BLE001 - 1 件の失敗で全体を止めない
        log(f"      取得失敗: {type(e).__name__}")
        return None


def get_bytes(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.read()
    except Exception as e:  # noqa: BLE001
        log(f"      画像を落とせません: {type(e).__name__}")
        return None


def load_painters() -> list[dict]:
    """painters.ts を esbuild で実行して JSON にする（正規表現で TS を読まない）。"""
    script = ROOT / "tools" / "_dump_painters.mjs"
    script.write_text(
        'import { build } from "esbuild";\n'
        'const r = await build({ entryPoints: ["src/core/painters.ts"], bundle: true,'
        ' format: "esm", write: false, platform: "node" });\n'
        'const m = await import("data:text/javascript;base64," +'
        ' Buffer.from(r.outputFiles[0].text).toString("base64"));\n'
        "process.stdout.write(JSON.stringify(m.PAINTERS));\n",
        encoding="utf-8",
    )
    try:
        out = subprocess.run(
            ["node", str(script)], cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout
        return json.loads(out)
    finally:
        script.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# 出典 1: Met Museum Open Access
# ---------------------------------------------------------------------------

MET_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search"
MET_OBJECT = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"


# 題名照合で無視する語。これだけ一致しても「同じ作品」とは言えない。
STOPWORDS = {
    "the", "a", "an", "of", "in", "on", "at", "and", "or", "with", "from",
    "to", "for", "by", "no", "des", "de", "la", "le", "les", "el",
}

# 画像として扱えない拡張子。Commons には PDF や DjVu の資料も混ざる
# （実際に、画家名を含むオークション目録の PDF を掴んだことがある）。
BITMAP_EXT = (".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp")

# 題名に含まれていたら採らない語。
# 🔴 **「同じ題名の別物」を弾くためにある。** 作品名が一致していても、
#    - 部分の切り抜き（detail / fragment）
#    - 下絵・習作（study / sketch）
#    - 他人による模写・複製版画（after / copy / replica / engraved by）
#    は「その画家のその作品」として一覧に出すには不適切。
#    実際にターナーの「雨、蒸気、速度」で **R.Brandard による後年の版画**を、
#    ドラクロワの「民衆を導く自由の女神」で **人体の習作**を掴んだ。
REJECT_RE = re.compile(
    r"\b(detail|details|fragment|study|studies|sketch|after|copy|replica|"
    r"reproduction|engraved|lithograph\s+after|imitation|manner)\b",
    re.IGNORECASE,
)


def deaccent(s: str) -> str:
    """Dürer / Böcklin / Kōrin の発音記号を落として照合できるようにする。"""
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))


def name_parts(name_en: str) -> list[str]:
    """照合に使う名前の断片。姓だけでは "Sesshu Toyo" のような並びを取りこぼす。"""
    return [p.lower() for p in re.split(r"[\s.]+", deaccent(name_en)) if len(p) >= 4]


def artist_matches(painter: dict, *haystacks: str) -> bool:
    """候補が**その画家の作品**か。

    🔴 ここが無いと、題名だけで別の画家の絵を掴む。実際に
       カンディンスキーの「コンポジション VIII」で
       **テオ・ファン・ドースブルフの Counter-composition VIII** を掴んだ。
       Commons の全文検索は画家名を無視して題名だけで当ててくるので、
       ファイル名か extmetadata のどちらかに画家名が出ることを必ず確かめる。
    """
    parts = name_parts(painter["nameEn"])
    if not parts:
        return False
    hay = deaccent(" ".join(haystacks)).lower()
    return any(part in hay for part in parts)


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "")


def title_tokens(title: str) -> set[str]:
    """照合に使う語を取り出す。短すぎる語と一般語は落とす。

    🔴 **先に発音記号を落とす。** そうしないと "Déjeuner" が "d" と "jeuner" に
       割れて、原語の題名と一致しなくなる（照合が通らず別の作品に落ちる）。
    """
    words = re.findall(r"[A-Za-z]+", deaccent(title).lower())
    return {w for w in words if len(w) >= 4 and w not in STOPWORDS}


def title_matches(requested: str, candidate: str) -> bool:
    """候補が「依頼した作品」と言えるか。

    🔴 ここを緩めない。緩めると**ラベルと画像が食い違う**
    （「真珠の耳飾りの少女」と書いてある隣に別の絵が出る）。
    一覧に代表作を出す目的そのものが壊れるので、確信が持てないものは捨てる。
    """
    want = title_tokens(requested)
    if not want:
        return False
    have = title_tokens(candidate)
    # 特徴的な語がすべて含まれていれば同じ作品と見なす。
    # 1 語しかない題（"Irises" など）は、その 1 語の一致を要求する。
    hit = want & have
    return len(hit) == len(want) if len(want) <= 2 else len(hit) >= max(2, len(want) - 1)


def from_met(painter: dict, work_en: str) -> tuple[bytes, dict] | None:
    q = urllib.parse.urlencode({"q": work_en, "hasImages": "true"})
    res = get_json(f"{MET_SEARCH}?{q}")
    if not res or not res.get("objectIDs"):
        return None

    for oid in res["objectIDs"][:15]:
        obj = get_json(f"{MET_OBJECT}{oid}")
        if not obj:
            continue
        # 🔴 PD フラグが立っていないものは採らない。
        if not obj.get("isPublicDomain"):
            continue
        title = obj.get("title") or ""
        if not artist_matches(painter, obj.get("artistDisplayName") or ""):
            continue
        # 🔴 作者が合っていても、**別の作品**なら採らない。
        if not title_matches(work_en, title):
            continue
        # 🔴 習作・部分・他人の模写は「その作品」ではない。
        if REJECT_RE.search(title):
            log(f"      題名に習作/部分/模写の語: {title}")
            continue
        url = obj.get("primaryImageSmall") or obj.get("primaryImage")
        if not url:
            continue
        raw = get_bytes(url)
        if not raw:
            continue
        return raw, {
            "source": "The Metropolitan Museum of Art (Open Access)",
            "license": "CC0 1.0",
            "title": title or work_en,
            "url": obj.get("objectURL") or f"{MET_OBJECT}{oid}",
        }
    return None


# ---------------------------------------------------------------------------
# 出典 2: Wikimedia Commons
# ---------------------------------------------------------------------------

COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# 原語の題名でしか登録されていない作品は、検索では辿り着けない。
# 🔴 照合を緩めると別物を掴む（実際にオークション目録の PDF を拾った）ので、
#    **緩めずに、例外だけ名指しする**。ここに挙げたファイルもライセンスは検査する。
MANUAL_FILES = {
    # 「抱擁」はドイツ語の Umarmung でしか登録がない
    "schiele": "Egon Schiele - Umarmung (1917).jpg",
    # 「夢」はフランス語の Le Rêve。英題のものは CC BY のポスター写真で採れない
    "rousseau": "Henri Rousseau - Le Rêve - Google Art Project.jpg",
    # 「湖畔」はローマ字表記（kohan）のファイル名
    "kurodaSeiki": "Kuroda-seiki-kohan00-6-1b.jpeg",
    # 「キュクロプス」で検索すると、英訳題に Cyclops を含む**別の版画**
    #   （Le Polype difforme…）が先に当たる。絵画そのものを名指しする。
    "redon": "Redon.cyclops.jpg",
    # 「ムーラン・ルージュにて」は、同じ会場を描いた別の石版画
    #   （The Englishman at the Moulin Rouge）が先に当たる。絵画を名指しする。
    "toulouseLautrec": "Henri de Toulouse-Lautrec - At the Moulin Rouge - Google Art Project.jpg",
}


def from_commons_file(file_title: str) -> tuple[bytes, dict] | None:
    """Commons のファイルを名指しで取る。ライセンス検査は検索経路と同じ。"""
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": f"File:{file_title}",
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|mediatype",
            "iiurlwidth": "600",
        }
    )
    res = get_json(f"{COMMONS_API}?{q}")
    pages = ((res or {}).get("query") or {}).get("pages") or {}
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        lic = ((info.get("extmetadata") or {}).get("LicenseShortName") or {}).get("value", "")
        if not any(m in lic.lower() for m in PD_MARKERS):
            log(f"      名指しファイルが PD でない: {lic}")
            return None
        url = info.get("thumburl") or info.get("url")
        if not url:
            return None
        raw = get_bytes(url)
        if not raw:
            return None
        return raw, {
            "source": "Wikimedia Commons",
            "license": lic,
            "title": file_title,
            "url": info.get("descriptionurl") or url,
        }
    return None


def from_commons(painter: dict, work_en: str) -> tuple[bytes, dict] | None:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"{painter['nameEn']} {work_en}",
            "gsrnamespace": "6",
            "gsrlimit": "6",
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mediatype",
            "iiurlwidth": "600",
        }
    )
    res = get_json(f"{COMMONS_API}?{q}")
    pages = ((res or {}).get("query") or {}).get("pages") or {}

    for page in pages.values():
        file_title = page.get("title", "").replace("File:", "")
        # 🔴 画像以外を弾く。Commons には資料の PDF / DjVu も入っており、
        #    画家名を含むだけのオークション目録を掴んだことがある。
        if not file_title.lower().endswith(BITMAP_EXT):
            continue
        info = (page.get("imageinfo") or [{}])[0]
        if (info.get("mediatype") or "BITMAP") != "BITMAP":
            continue
        # 🔴 作品名が一致しないものは採らない（ラベルと画像を食い違わせない）。
        if not title_matches(work_en, file_title):
            continue
        # 🔴 習作・部分・他人の模写は「その作品」ではない。
        if REJECT_RE.search(file_title):
            log(f"      題名に習作/部分/模写の語: {file_title}")
            continue
        meta = info.get("extmetadata") or {}
        # 🔴 **その画家の絵か**を確かめる。Commons の全文検索は題名だけで
        #    当ててくるので、これが無いと別の画家の絵が入る。
        artist_field = strip_tags((meta.get("Artist") or {}).get("value", ""))
        credit_field = strip_tags((meta.get("Credit") or {}).get("value", ""))
        if not artist_matches(painter, file_title, artist_field, credit_field):
            log(f"      画家名が確認できない: {file_title}")
            continue
        lic = (meta.get("LicenseShortName") or {}).get("value", "")
        # 🔴 PD / CC0 と読み取れないものは採らない。
        if not any(m in lic.lower() for m in PD_MARKERS):
            continue
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        raw = get_bytes(url)
        if not raw:
            continue
        return raw, {
            "source": "Wikimedia Commons",
            "license": lic,
            "title": page.get("title", "").replace("File:", ""),
            "url": info.get("descriptionurl") or url,
        }
    return None


# ---------------------------------------------------------------------------
# 画像の加工
# ---------------------------------------------------------------------------


def to_thumb(raw: bytes) -> bytes | None:
    """長辺 THUMB_PX の JPEG にする。MAX_BYTES に収まらなければ採らない。"""
    try:
        im = Image.open(io.BytesIO(raw))
        im.load()
    except Exception as e:  # noqa: BLE001
        log(f"      画像を開けません: {type(e).__name__}")
        return None

    # 透過や CMYK が混ざるので、白地に載せて RGB へ落とす。
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")

    im.thumbnail((THUMB_PX, THUMB_PX), Image.LANCZOS)

    for q in QUALITIES:
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=q, optimize=True, progressive=False)
        data = buf.getvalue()
        if len(data) <= MAX_BYTES:
            return data
    return None


# ---------------------------------------------------------------------------
# 生成
# ---------------------------------------------------------------------------


def write_thumbs_ts(entries: dict[str, dict]) -> None:
    lines = [
        "/**",
        " * 画家の代表作サムネイル（base64 の data URI）。",
        " *",
        " * 🔴 **このファイルは `npm run thumbs` が生成する。手で編集しない。**",
        " *",
        " * プラグインは `plugin.json` と `ui.js` しか配信できず、本体の CSP も",
        " * `img-src 'self' data: blob:` なので、画像は data URI で持つしかない。",
        " * 取得は開発時の一度きりで、実行時にネットワークへは出ない。",
        " *",
        " * 収録しているのはパブリックドメインと確認できた画像だけ。",
        " * 出所は `THIRD-PARTY-IMAGES.md` に記録してある。",
        " */",
        "",
        "/** 1 枚のサムネイル。 */",
        "export type PainterThumb = {",
        "  /** data URI。CSP の `img-src data:` に乗る形。 */",
        "  readonly src: string;",
        "  /**",
        "   * **この画像が実際に何の絵なのか。**",
        "   *",
        "   * 🔴 `painter.works[0]` と同じとは限らない。1 点目のパブリックドメイン",
        "   * 画像が見つからず 2 点目に落ちることがあるため、**一覧のラベルは",
        "   * 必ずこちらを使う**こと。works[0] を出すと題名と絵が食い違う。",
        "   */",
        "  readonly workJa: string;",
        "  readonly workEn: string;",
        "};",
        "",
        "/** 画家 id → サムネイル。**載っていない画家がある**ので、必ず存在確認してから使う。 */",
        "export const PAINTER_THUMBS: Record<string, PainterThumb> = {",
    ]
    for pid in sorted(entries):
        e = entries[pid]
        lines.append(f"  {json.dumps(pid)}: {{")
        lines.append(f'    src: "data:image/jpeg;base64,{e["b64"]}",')
        lines.append(f"    workJa: {json.dumps(e['workJa'], ensure_ascii=False)},")
        lines.append(f"    workEn: {json.dumps(e['workEn'], ensure_ascii=False)},")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    THUMBS_TS.write_text("\n".join(lines), encoding="utf-8")


def write_credits(rows: list[dict], missing: list[str]) -> None:
    out = [
        "# 収録画像の出典",
        "",
        "画家一覧に出すサムネイルは、**パブリックドメインと確認できた画像だけ**を収録しています。",
        "取得は `npm run thumbs`（`tools/fetch-thumbs.py`）で行い、結果は",
        "`src/core/thumbs.ts` に base64 の data URI として埋め込まれます。",
        "",
        "パブリックドメインの作品であっても、どこから取得したものかを辿れるように出所を残しています。",
        "",
        "一覧に出しているラベル（収録作品）と、実際に取得したファイルの題名を並べています。",
        "**この 2 つが食い違っていたら取得の照合が壊れています。**",
        "",
        "| 画家 | 収録作品 | 取得したファイル | 出典 | ライセンス | URL |",
        "|---|---|---|---|---|---|",
    ]
    for r in sorted(rows, key=lambda x: x["painter"]):
        title = r["title"].replace("|", "/")
        out.append(
            f"| {r['painter']} | {r['work']} | {title} | {r['source']} "
            f"| {r['license']} | <{r['url']}> |"
        )
    if missing:
        out += [
            "",
            "## 画像を収録していない画家",
            "",
            "パブリックドメインと確認できる画像が見つからなかったため、**収録していません**。",
            "一覧では無地で表示されます（別の絵で代用はしません）。",
            "",
        ]
        out += [f"- {m}" for m in missing]
    out.append("")
    CREDITS_MD.write_text("\n".join(out), encoding="utf-8")


def main() -> int:
    painters = load_painters()
    log(f"画家 {len(painters)} 人ぶんのサムネイルを取得します\n")

    entries: dict[str, dict] = {}
    rows: list[dict] = []
    missing: list[str] = []
    total = 0

    for i, p in enumerate(painters, 1):
        works = [w for w in p.get("works", []) if w.get("en")]
        log(f"[{i:2d}/{len(painters)}] {p['nameJa']} — {works[0]['en'] if works else '(英題なし)'}")
        if not works:
            missing.append(f"{p['nameJa']}（代表作の英題が未記入）")
            continue

        # 1 点目が見つからなければ 2 点目を試す。**別の画家の絵で代用はしない。**
        got = None
        work = works[0]

        # 原語題名しか無い作品は名指しで取る。
        if p["id"] in MANUAL_FILES:
            got = from_commons_file(MANUAL_FILES[p["id"]])
            if got:
                log(f"      Commons から取得（名指し: {MANUAL_FILES[p['id']]}）")

        for w in works if not got else []:
            for name, fn in (("Met", from_met), ("Commons", from_commons)):
                got = fn(p, w["en"])
                if got:
                    work = w
                    log(f"      {name} から取得（{w['en']}）")
                    break
                time.sleep(0.3)
            if got:
                break

        if not got:
            log("      ✗ パブリックドメイン画像が見つかりません")
            missing.append(f"{p['nameJa']}（{work['en']}）")
            continue

        raw, credit = got
        thumb = to_thumb(raw)
        if not thumb:
            log(f"      ✗ {MAX_BYTES} バイトに収まりません")
            missing.append(f"{p['nameJa']}（{work['en']}・縮小できず）")
            continue

        # 🔴 **採れた作品を記録する。** 1 点目が採れずに 2 点目へ落ちることが
        #    あるので、一覧のラベルは「works[0]」ではなく**この作品**を出す。
        #    そうしないと「群鶏図」と書いてある隣に「梅花群鶴図」が並ぶ。
        entries[p["id"]] = {
            "b64": base64.b64encode(thumb).decode("ascii"),
            "workJa": work["ja"],
            "workEn": work["en"],
        }
        total += len(thumb)
        rows.append({"painter": p["nameJa"], "work": work["ja"], **credit})
        log(f"      ✓ {len(thumb)} バイト（{credit['license']}）")
        time.sleep(0.3)

    write_thumbs_ts(entries)
    write_credits(rows, missing)

    log("")
    log(f"収録: {len(entries)} 人 / 合計 {total / 1024:.0f} KB（base64 で約 {total * 4 / 3 / 1024:.0f} KB）")
    if missing:
        log(f"\n収録できなかった画家 {len(missing)} 人:")
        for m in missing:
            log(f"  - {m}")
        log("\n→ 代表作の英題を見直すか、手で curate してください。")
    return 0


# ---------------------------------------------------------------------------
# 照合の自己検査（ネットワーク不要）
# ---------------------------------------------------------------------------

# 🔴 **実際に掴んだ誤りをそのまま並べてある。**
#    照合は 2 度壊れた（別の画家の絵・習作や複製版画）。取得は手動でネットワークも
#    使うので `npm run verify` からは回せない。せめて規則だけは
#    `python3 tools/fetch-thumbs.py --self-test` で 1 秒で確かめられるようにする。
SELF_TEST_ARTIST = [
    # (画家の英名, 候補の文字列, 通すべきか, なぜ)
    ("Wassily Kandinsky", "Theo van Doesburg Counter-composition VIII 2", False,
     "別の画家。題名だけ見ると一致するので、これを弾けないと一覧が壊れる"),
    ("Wassily Kandinsky", "Vassily Kandinsky, 1923 - Composition 8", True, "本人"),
    ("Ogata Korin", "Ogata Kōrin - Irises screen", True, "長音記号を落として照合する"),
    ("Sesshu Toyo", "Sesshū - Autumn and Winter Landscape", True, "姓ではなく号で載っている"),
    ("Albrecht Durer", "Albrecht Dürer, Melencolia I, 1514", True, "ウムラウト"),
    ("Juan Gris", "JuanGris.Portrait of Picasso", True, "区切りが無い"),
    ("Arnold Bocklin", "Arnold Böcklin - The Isle of the Dead", True, "ö"),
]

SELF_TEST_REJECT = [
    ("(Barcelona) Rain, Steam,and Speed After William Truner - R.Brandard", True,
     "他人による後年の複製版画"),
    ('Eugène Delacroix, Study of Bodies "Liberty Leading the People", 1830', True, "習作"),
    ("Rembrandt, Harmensz. van Rijn - The Night Watch (detail)", True, "部分の切り抜き"),
    ("Detail of Madame X (Madame Pierre Gautreau), John Singer Sargent", True, "部分の切り抜き"),
    ('Study for "A Sunday on La Grande Jatte"', True, "習作"),
    ("Hasegawa Tohaku, Pine Trees - low resolution", False,
     "解像度が低いだけで作品は合っている。96px に縮めるので問題ない"),
    ("Monet - Impression, Sunrise", False, "正しい候補"),
    ("Afternoon on the Seine", False, "'after' の部分一致で誤爆しないこと"),
]

SELF_TEST_TITLE = [
    ("Le Dejeuner sur l'herbe", "Edouard Manet - Olympia - Google Art Project", False,
     "別の作品。works[0] が採れないときは 2 点目に落ちる（ラベルもそちらに合わせる）"),
    ("Rooster and Hens", "'Plum Blossoms and Cranes' by Ito Jakuchu", False, "同じ画家の別作品"),
    ("The Kiss", "Klimt - The Kiss", True, "一致"),
    ("Le Dejeuner sur l'herbe", "Édouard Manet - Le Déjeuner sur l'herbe", True,
     "発音記号を落とさないと Déjeuner が d + jeuner に割れて一致しない"),
    ("Liberty Leading the People", "La Liberté guidant le peuple", False,
     "原語の題名は照合では辿り着けない。緩めずに MANUAL_FILES で名指しする"),
    ("Under the Wave off Kanagawa", "Under the Wave off Kanagawa (Kanagawa oki nami ura)", True,
     "副題つき"),
]


def self_test() -> int:
    bad = 0
    for name, cand, want, why in SELF_TEST_ARTIST:
        got = artist_matches({"nameEn": name}, cand)
        if got != want:
            bad += 1
            log(f"✗ artist_matches({name!r}, {cand!r}) = {got}、期待 {want} — {why}")
    for title, want, why in SELF_TEST_REJECT:
        got = bool(REJECT_RE.search(title))
        if got != want:
            bad += 1
            log(f"✗ REJECT_RE({title!r}) = {got}、期待 {want} — {why}")
    for req, cand, want, why in SELF_TEST_TITLE:
        got = title_matches(req, cand)
        if got != want:
            bad += 1
            log(f"✗ title_matches({req!r}, {cand!r}) = {got}、期待 {want} — {why}")

    n = len(SELF_TEST_ARTIST) + len(SELF_TEST_REJECT) + len(SELF_TEST_TITLE)
    log(f"照合の自己検査: {n - bad}/{n} 通過" if bad else f"照合の自己検査: {n} 件すべて通過")
    return 1 if bad else 0


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(self_test())
    sys.exit(main())
