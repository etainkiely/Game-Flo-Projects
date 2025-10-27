#!/usr/bin/env python3
"""
Scrape images and video links from a published Google Sites (or any public site),
download images, and generate:
  - assets/imported/<host>/images/...
  - assets/imported/<host>/data/media.csv
  - assets/imported/<host>/GALLERY.md
  - assets/imported/<host>/gallery.html   (nice responsive grid)

Run locally:
  python scripts/scrape_media.py --start-url "https://sites.google.com/view/your-site/"

Idempotent: reruns skip already-downloaded files.
"""

import argparse, os, re, csv, time
from urllib.parse import urljoin, urlparse
from html import escape

import requests
from bs4 import BeautifulSoup
from slugify import slugify

UA = "MediaScraper/1.1 (+github.com/etainkiely)"
DEFAULT_ALLOWED = (
    "sites.google.com,googleusercontent.com,lh3.googleusercontent.com,"
    "ggpht.com,gstatic.com,ytimg.com,youtube.com,youtu.be,vimeo.com"
)
TIMEOUT = 25
SLEEP_BETWEEN = 0.2

YOUTUBE_PAT = re.compile(r"(youtu\.be/|youtube\.com/(watch|embed))", re.I)
VIMEO_PAT   = re.compile(r"vimeo\.com", re.I)

session = requests.Session()
session.headers.update({"User-Agent": UA})

def boost_google_image_quality(url: str) -> str:
    # Request original-sized assets on Google CDNs (strip size params; add =s0)
    if "googleusercontent.com" in url or "ggpht.com" in url:
        base, _, _ = url.partition("=")
        return f"{base}=s0"
    return url

def normalize_url(base, link):
    if not link:
        return None
    link = link.strip()
    if link.startswith("data:"):
        return None
    return urljoin(base, link)

def is_allowed(url, allow_domains):
    host = urlparse(url).netloc.lower()
    return any(dom in host for dom in allow_domains)

def fetch_html(url):
    r = session.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    if "text/html" not in r.headers.get("Content-Type", ""):
        return None
    return r.text

def crawl(start_url, allow_domains, max_pages=60):
    """BFS crawl limited to allowed domains, returns list of (url, soup)."""
    seen, q, pages = set(), [start_url], []
    while q and len(pages) < max_pages:
        url = q.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            html = fetch_html(url)
            if not html:
                continue
        except Exception:
            continue
        soup = BeautifulSoup(html, "html.parser")
        pages.append((url, soup))

        for a in soup.select('a[href], link[rel="canonical"][href]'):
            nxt = normalize_url(url, a.get("href"))
            if nxt and nxt not in seen and is_allowed(nxt, allow_domains):
                q.append(nxt)
        time.sleep(SLEEP_BETWEEN)
    return pages

def extract_media(pages):
    images, videos = set(), set()
    for base, soup in pages:
        # <img>, <source>, <video>
        for tag in soup.find_all(["img", "source", "video"]):
            src = tag.get("src") or tag.get("data-src")
            full = normalize_url(base, src)
            if full:
                full = boost_google_image_quality(full)
                images.add(full)

        # inline background-image: url(...)
        for el in soup.select("[style*='background']"):
            style = el.get("style", "")
            m = re.search(r"url\(['\"]?([^'\"\)]+)", style, re.I)
            if m:
                full = normalize_url(base, m.group(1))
                if full:
                    full = boost_google_image_quality(full)
                    images.add(full)

        # video platforms
        for el in soup.select("iframe[src], a[href]"):
            href = el.get("src") or el.get("href")
            full = normalize_url(base, href)
            if not full:
                continue
            if YOUTUBE_PAT.search(full) or VIMEO_PAT.search(full):
                videos.add(full)

    return sorted(images), sorted(videos)

def safe_name_from_url(url):
    path = urlparse(url).path
    name = os.path.basename(path) or slugify(path)
    if not os.path.splitext(name)[1]:
        name += ".bin"
    return name

def download(url, outdir):
    os.makedirs(outdir, exist_ok=True)
    dest = os.path.join(outdir, safe_name_from_url(url))
    if os.path.exists(dest):
        return dest
    try:
        with session.get(url, stream=True, timeout=TIMEOUT) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
        return dest
    except Exception:
        return None

def write_csv(csv_path, images_saved, video_links):
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["type", "source_url", "local_path_or_link"])
        for src, rel in images_saved:
            w.writerow(["image", src, rel])
        for v in video_links:
            w.writerow(["video", v, v])

def write_markdown(md_path, start_url, images_saved, video_links):
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# Imported media from {start_url}\n\n")
        f.write("## Images\n\n")
        for _, rel in images_saved:
            f.write(f"![img]({rel})\n\n")
        f.write("## Videos\n\n")
        for v in video_links:
            f.write(f"- {v}\n")

def write_gallery_html(html_path, start_url, images_saved, video_links):
    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    page_title = f"Gallery · Imported from {start_url}"
    head = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(page_title)}</title>
<style>
  :root {{
    --gap: 12px;
    --bg: #0b1020;
    --card: #11182a;
    --text: #e7f0ff;
  }}
  body {{
    margin: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }}
  header {{
    padding: 20px 24px;
    background: linear-gradient(90deg,#0b1020,#12243f);
    position: sticky; top: 0; z-index: 10;
    box-shadow: 0 2px 10px rgba(0,0,0,.25);
  }}
  h1 {{ margin: 0; font-size: 22px; }}
  main {{ padding: 20px; }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--gap);
  }}
  .tile {{
    background: var(--card);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,.35);
    transition: transform .12s ease;
  }}
  .tile:hover {{ transform: translateY(-3px); }}
  .tile img {{
    width: 100%; height: 180px; object-fit: cover; display: block;
  }}
  .meta {{ padding: 10px 12px; font-size: 12px; opacity: .85 }}
  .videos {{ margin-top: 32px; }}
  a {{ color: #7cc4ff; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
</style>
<header><h1>{escape(page_title)}</h1></header>
<main>
<section class="grid">
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(head)
        for src, rel in images_saved:
            f.write(
                f'<article class="tile">'
                f'<a href="{escape(rel)}" target="_blank" rel="noopener">'
                f'<img loading="lazy" src="{escape(rel)}" alt="">'
                f'</a>'
                f'<div class="meta">{escape(os.path.basename(rel))}</div>'
                f'</article>\n'
            )
        f.write("</section>\n")

        if video_links:
            f.write('<section class="videos"><h2>Videos</h2><ul>\n')
            for v in video_links:
                f.write(f'<li><a href="{escape(v)}" target="_blank" rel="noopener">{escape(v)}</a></li>\n')
            f.write("</ul></section>\n")

        f.write("</main></html>")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-url", required=True, help="Published site URL (e.g., https://sites.google.com/view/your-site/)")
    ap.add_argument("--allow-domains", default=DEFAULT_ALLOWED, help="Comma-separated allow list (domain substrings).")
    ap.add_argument("--max-pages", type=int, default=60)
    ap.add_argument("--out-prefix", default="assets/imported")
    args = ap.parse_args()

    start_url = args.start_url.strip()
    allow = [d.strip().lower() for d in args.allow_domains.split(",") if d.strip()]
    host_slug = slugify(urlparse(start_url).netloc or "site")
    base_out  = os.path.join(args.out_prefix, host_slug)
    img_dir   = os.path.join(base_out, "images")
    data_dir  = os.path.join(base_out, "data")
    md_path   = os.path.join(base_out, "GALLERY.md")
    html_path = os.path.join(base_out, "gallery.html")
    csv_path  = os.path.join(data_dir, "media.csv")

    print(f"=== Crawl start: {start_url}")
    pages = crawl(start_url, allow_domains=allow, max_pages=args.max_pages)
    print(f"Discovered pages: {len(pages)}")

    images, videos = extract_media(pages)
    print(f"Found {len(images)} images and {len(videos)} video links")

    saved_pairs = []
    for idx, url in enumerate(images, 1):
        dest = download(url, img_dir)
        if dest:
            rel = os.path.relpath(dest, start=os.getcwd())
            saved_pairs.append((url, rel))
        if idx % 10 == 0:
            print(f"  downloaded {idx}/{len(images)}")

    write_csv(csv_path, saved_pairs, videos)
    write_markdown(md_path, start_url, saved_pairs, videos)
    write_gallery_html(html_path, start_url, saved_pairs, videos)

    print(f"Images saved → {img_dir}")
    print(f"Manifest     → {csv_path}")
    print(f"Markdown     → {md_path}")
    print(f"HTML gallery → {html_path}")

if __name__ == "__main__":
    main()
