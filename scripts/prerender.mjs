// Generuje statyczne pliki HTML dla każdej strony (SEO i szybki pierwszy widok),
// powłokę aplikacji dla stron osobistych, stronę błędu 404, mapę strony i plik dla asystenta AI.
// Użycie: node scripts/prerender.mjs [katalog wyjściowy, domyślnie dist]
// W wersji prywatnej (vite build --mode private) wszystkie strony dostają noindex, a serwer tryb jednego właściciela.
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outName = process.argv[2] ?? 'dist';
const dist = join(root, outName);
const ssrDir = join(root, 'dist-ssr');
const BASE = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
const SITE_NAME = 'Transerfing w praktyce';

const { render, getPrerenderPages, getShellPaths, buildKnowledge, PRIVATE, STATIC } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
// W wersji prywatnej pomijamy adres serwisu: bez mapy strony, bez canonical i bez podglądu linków.
const SITE_URL = PRIVATE ? '' : (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error(`Brak znaczników <!--app-html--> lub <!--app-head--> w ${outName}/index.html`);
}

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const absolute = (path) => (SITE_URL ? SITE_URL + BASE.replace(/\/$/, '') + path : '');

function htmlPage({ html = '', title, description, path = '', type = 'website', noindex = false }) {
  const fullTitle = path === '/' || !title ? title || SITE_NAME : `${title} · ${SITE_NAME}`;
  const url = path ? absolute(path) : '';
  const head = PRIVATE
    ? ['<meta name="robots" content="noindex, nofollow" />']
    : [
        noindex ? '<meta name="robots" content="noindex" />' : '',
        url && !noindex ? `<link rel="canonical" href="${escape(url)}" />` : '',
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        '<meta property="og:locale" content="pl_PL" />',
        `<meta property="og:type" content="${type}" />`,
        `<meta property="og:title" content="${escape(fullTitle)}" />`,
        `<meta property="og:description" content="${escape(description)}" />`,
        url ? `<meta property="og:url" content="${escape(url)}" />` : '',
        SITE_URL ? `<meta property="og:image" content="${escape(absolute('/og-image.png'))}" />` : '',
        SITE_URL ? '<meta property="og:image:width" content="1200" />' : '',
        SITE_URL ? '<meta property="og:image:height" content="630" />' : '',
        `<meta name="twitter:card" content="${SITE_URL ? 'summary_large_image' : 'summary'}" />`,
      ].filter(Boolean);
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(fullTitle)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escape(description)}" />`)
    .replace('<!--app-head-->', head.join('\n    '))
    .replace('<!--app-html-->', html);
}

function write(path, content) {
  const file = path === '/' ? join(dist, 'index.html') : join(dist, ...path.split('/').filter(Boolean), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const pages = getPrerenderPages();
const seen = new Set();
for (const page of pages) {
  if (seen.has(page.path)) throw new Error(`Powtórzony adres: ${page.path}`);
  seen.add(page.path);
  const html = await render(page.path);
  if (!html || html.length < 200) throw new Error(`Pusta strona: ${page.path}`);
  write(page.path, htmlPage({ ...page, html }));
}

const shellDescription = 'Twoja codzienna praktyka Transerfingu. Dane zapisują się w twojej przeglądarce.';
const shell = htmlPage({ title: SITE_NAME, description: shellDescription, noindex: true });
const shellPaths = getShellPaths();
for (const path of shellPaths) {
  if (seen.has(path)) throw new Error(`Adres jest jednocześnie stroną i powłoką: ${path}`);
  write(path, shell);
}
writeFileSync(join(dist, 'app.html'), shell);
mkdirSync(join(dist, 'errors'), { recursive: true });
writeFileSync(join(dist, 'errors', '404.html'), htmlPage({ title: 'Nie znaleziono strony', description: shellDescription, noindex: true }));

const robots = PRIVATE ? ['User-agent: *', 'Disallow: /'] : STATIC ? ['User-agent: *', 'Allow: /'] : ['User-agent: *', 'Allow: /', `Disallow: ${BASE}api/`];
if (SITE_URL) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map((p) => `  <url><loc>${escape(absolute(p.path))}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  robots.push(`Sitemap: ${absolute('/sitemap.xml')}`);
}
writeFileSync(join(dist, 'robots.txt'), `${robots.join('\n')}\n`);

if (STATIC) {
  // Wersja bez serwera (GitHub Pages): bez API w PHP i bez plików .htaccess, strona błędu tam, gdzie szuka jej GitHub Pages.
  rmSync(join(dist, 'api'), { recursive: true, force: true });
  for (const file of ['.htaccess', 'assets/.htaccess']) rmSync(join(dist, file), { force: true });
  writeFileSync(join(dist, '404.html'), readFileSync(join(dist, 'errors', '404.html')));
  rmSync(join(dist, 'errors'), { recursive: true, force: true });
  writeFileSync(join(dist, '.nojekyll'), '');
} else {
  mkdirSync(join(dist, 'api'), { recursive: true });
  writeFileSync(join(dist, 'api', 'knowledge.json'), JSON.stringify(buildKnowledge()));
}

if (PRIVATE) {
  // Znacznik dla serwera: domyślnie jedno konto (właściciela), powiadomienia i asystent tylko po zalogowaniu.
  writeFileSync(join(dist, 'api', 'lib', 'edition.php'), "<?php\n// Wersja prywatna serwisu (npm run build:private). Ustawienia domyślne: zobacz ts_config_defaults().\nreturn ['private' => true];\n");
  // Hasło na całą stronę: gotowe linie do włączenia przez właściciela.
  appendFileSync(
    join(dist, '.htaccess'),
    [
      '',
      '# Haslo na cala strone (opcjonalnie). Instrukcja w README, punkt "Haslo na cala strone".',
      '# 1. Przez SSH utworz plik hasel:  htpasswd -c /usr/home/LOGIN/transerfing.passwd ja',
      '#    i nadaj prawo odczytu:         chmod +r /usr/home/LOGIN/transerfing.passwd',
      '# 2. Usun znak # z czterech linii ponizej i wpisz swoj login MyDevil zamiast LOGIN.',
      '#AuthType Basic',
      '#AuthName "Transerfing"',
      '#AuthUserFile "/usr/home/LOGIN/transerfing.passwd"',
      '#require valid-user',
      '',
    ].join('\n'),
  );
  // Katalog weryfikacji certyfikatu Let's Encrypt zostaje dostępny także po włączeniu hasła.
  mkdirSync(join(dist, '.well-known'), { recursive: true });
  writeFileSync(
    join(dist, '.well-known', '.htaccess'),
    '# Weryfikacja certyfikatu SSL musi dzialac takze po wlaczeniu hasla na cala strone.\n<RequireAll>\n    Require all granted\n</RequireAll>\n',
  );
}

// Service worker: lista plików do pracy offline i numer wersji (nowa wersja = nowy plik sw.js = aktualizacja u odwiedzających).
const assets = existsSync(join(dist, 'assets'))
  ? readdirSync(join(dist, 'assets'))
      .filter((name) => /\.(js|css|woff2?)$/.test(name))
      .sort()
      .map((name) => `assets/${name}`)
  : [];
const buildId = createHash('sha256').update(assets.join('\n')).update(shell).digest('hex').slice(0, 12);
const swPath = join(dist, 'sw.js');
const swSource = readFileSync(swPath, 'utf8');
const swBuilt = swSource
  .replace(/^const BUILD = .*;$/m, `const BUILD = ${JSON.stringify(buildId)};`)
  .replace(/^const PRECACHE = .*;$/m, `const PRECACHE = ${JSON.stringify(assets)};`);
if (!swBuilt.includes(buildId) || swBuilt.includes('const PRECACHE = [];')) throw new Error('Nie udało się wstawić listy plików do sw.js');
writeFileSync(swPath, swBuilt);

rmSync(ssrDir, { recursive: true, force: true });
console.log(
  [
    `Prerender (${outName}${PRIVATE ? ', wersja prywatna' : ''}${STATIC ? `, bez serwera, adres bazowy ${BASE}` : ''}): ${pages.length} stron z treścią, ${shellPaths.length} stron aplikacji, 404`,
    PRIVATE ? 'robots.txt blokuje wyszukiwarki' : SITE_URL ? `robots.txt, sitemap.xml (${SITE_URL})` : 'robots.txt (bez sitemap.xml: ustaw VITE_SITE_URL)',
    `sw.js ${buildId} (${assets.length} plików offline).`,
  ].join(', '),
);
