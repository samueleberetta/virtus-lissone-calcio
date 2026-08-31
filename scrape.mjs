import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE = 'https://virtuslissonecalcio.it';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const ROOT = path.resolve('.');
const ASSETS = path.join(ROOT, 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

// slug -> output html filename
const PAGES = {
  '/': 'index.html',
  '/iscrizioni/': 'iscrizioni.html',
  '/squadre/': 'squadre.html',
  '/under-10/': 'under-10.html',
  '/under-11/': 'under-11.html',
  '/under-13/': 'under-13.html',
  '/under-15/': 'under-15.html',
  '/under-19/': 'under-19.html',
  '/open-new/': 'open-new.html',
  '/open-sbc/': 'open-sbc.html',
  '/open-bianca/': 'open-bianca.html',
  '/storia/': 'storia.html',
  '/sponsor/': 'sponsor.html',
  '/contatti/': 'contatti.html',
};

const assetMap = new Map(); // absolute url -> local relative path (assets/xxx)

async function fetchBuf(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extFromUrl(u) {
  try {
    const p = new URL(u).pathname;
    const e = path.extname(p);
    return e || '';
  } catch { return ''; }
}

function localNameFor(url) {
  if (assetMap.has(url)) return assetMap.get(url);
  const clean = url.split('#')[0];
  let base;
  try { base = path.basename(new URL(clean).pathname) || 'file'; } catch { base = 'file'; }
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!path.extname(base)) base += extFromUrl(clean) || '';
  const hash = crypto.createHash('md5').update(clean).digest('hex').slice(0, 6);
  const name = `${hash}_${base}`.slice(0, 80);
  const rel = `assets/${name}`;
  assetMap.set(url, rel);
  return rel;
}

async function downloadAsset(url) {
  const rel = localNameFor(url);
  const dest = path.join(ROOT, rel);
  if (fs.existsSync(dest)) return rel;
  try {
    const buf = await fetchBuf(url);
    fs.writeFileSync(dest, buf);
    console.log('  asset', rel, `(${buf.length}b)`);
    // If CSS, process url() inside it
    if (rel.endsWith('.css')) {
      let css = buf.toString('utf8');
      const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map(m => m[1]);
      for (const raw of urls) {
        if (raw.startsWith('data:')) continue;
        let abs;
        try { abs = new URL(raw, url).href; } catch { continue; }
        if (!abs.startsWith('http')) continue;
        const childRel = await downloadAsset(abs).catch(() => null);
        if (childRel) {
          // css is in assets/, asset is in assets/ -> relative just filename
          const childName = path.basename(childRel);
          css = css.split(raw).join(childName);
        }
      }
      fs.writeFileSync(dest, css);
    }
    return rel;
  } catch (e) {
    console.log('  FAIL asset', url, e.message);
    return null;
  }
}

function rewriteHtml(html) {
  // Collect attribute URLs (href/src/srcset/content/data-*) pointing to BASE assets
  const assetUrlRe = new RegExp(`https?:\\\\?/\\\\?/virtuslissonecalcio\\.it/[^"'\\s)>]+`, 'g');
  return html;
}

async function processPage(slug, outfile) {
  console.log('PAGE', slug, '->', outfile);
  let html = (await fetchBuf(BASE + slug)).toString('utf8');

  // 1. Remove WP cruft (feeds, oembed, api links, emoji, xmlrpc)
  html = html.replace(/<link[^>]+(rel=["'](?:alternate|https:\/\/api\.w\.org\/|EditURI|wlwmanifest|shortlink|pingback|dns-prefetch)["']|wp-json|xmlrpc|oembed)[^>]*>/gi, '');
  html = html.replace(/<link[^>]+type=["']application\/(?:rss\+xml|json)["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]+name=["']generator["'][^>]*>/gi, '');

  // 2. Find all absolute asset URLs on this host, in plain OR backslash-escaped (\/) form.
  // Detect on a slash-normalized copy so we get canonical URLs, then replace every encoded variant.
  const normalized = html.replace(/\\\//g, '/');
  // Match each asset URL up to its extension boundary (handles URLs embedded in JSON blobs).
  const hostRe = /https:\/\/virtuslissonecalcio\.it\/[^"'\s)>\\&]*?\.(?:css|js|png|jpe?g|gif|svg|webp|woff2?|ttf|eot|ico|mp4|webm|json)(?:\?(?:ver=|[^"'\s)>\\]*ver=)[^"'\s)>\\&#]*)?/gi;
  const found = new Set();
  for (const m of normalized.matchAll(hostRe)) {
    found.add(m[0].replace(/&#0?38;/g, '&').replace(/&amp;/g, '&'));
  }
  for (const u of found) {
    await downloadAsset(u);
  }
  // Replace asset urls in all encodings: plain, &#038;, &amp;, and backslash-escaped slashes
  for (const [abs, rel] of assetMap) {
    if (!found.has(abs)) continue;
    const variants = new Set([
      abs,
      abs.replace(/&/g, '&#038;'),
      abs.replace(/&/g, '&amp;'),
      abs.replace(/\//g, '\\/'),                       // escaped slashes (in JSON blobs)
      abs.replace(/&/g, '&#038;').replace(/\//g, '\\/'),
    ]);
    const relEsc = rel.replace(/\//g, '\\/');
    for (const v of variants) {
      const target = v.includes('\\/') ? relEsc : rel;
      html = html.split(v).join(target);
    }
  }

  // 3. Rewrite internal page links to local html files
  for (const [pslug, pfile] of Object.entries(PAGES)) {
    const full = BASE + pslug;
    const target = pslug === '/' ? 'index.html' : pfile;
    html = html.split(`href="${full}"`).join(`href="${target}"`);
    html = html.split(`href='${full}'`).join(`href='${target}'`);
  }
  // Bare base url -> index
  html = html.split(`href="${BASE}/"`).join('href="index.html"');
  html = html.split(`href="${BASE}"`).join('href="index.html"');

  // 4. Neutralize remaining absolute links to the old domain (leftover pages/anchors) -> keep but strip domain won't exist; leave as-is if external
  fs.writeFileSync(path.join(ROOT, outfile), html);
  console.log('  wrote', outfile, `(${html.length} chars)`);
}

for (const [slug, outfile] of Object.entries(PAGES)) {
  try { await processPage(slug, outfile); }
  catch (e) { console.log('PAGE FAIL', slug, e.message); }
}
console.log('\nDONE. assets:', assetMap.size);
