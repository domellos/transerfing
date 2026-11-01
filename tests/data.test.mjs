// Spójność treści: wszystkie odwołania do lekcji, narzędzi, obszarów i sytuacji wskazują istniejące elementy.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { ROOT } from './helpers.mjs';

let server;
const data = {};

before(async () => {
  server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
  const load = (p) => server.ssrLoadModule(p);
  Object.assign(
    data,
    await load('/src/data/lessons/index.ts'),
    await load('/src/data/tools.ts'),
    await load('/src/data/program.ts'),
    await load('/src/data/quiz.ts'),
    await load('/src/data/glossary.ts'),
    await load('/src/data/challenges.ts'),
    await load('/src/data/navigator.ts'),
    await load('/src/data/areas.ts'),
    await load('/src/data/scenarios.ts'),
    await load('/src/data/flashcards.ts'),
    await load('/src/data/modules.ts'),
  );
  data.seo = await load('/src/seo.ts');
});

after(() => server?.close());

function unique(list, label) {
  const seen = new Set();
  for (const id of list) {
    assert.ok(!seen.has(id), `${label}: powtórzony identyfikator ${id}`);
    seen.add(id);
  }
}

test('odwołania między treściami', () => {
  const lessons = new Set(data.LESSONS.map((l) => l.slug));
  const tools = new Set(data.TOOLS.map((t) => t.id));
  const modules = new Set(data.MODULES.map((m) => m.id));
  const areas = new Set(data.AREAS.map((a) => a.slug));
  const problems = [];
  const lesson = (slug, where) => slug && !lessons.has(slug) && problems.push(`${where}: brak lekcji „${slug}”`);
  const tool = (id, where) => id && !tools.has(id) && problems.push(`${where}: brak narzędzia „${id}”`);

  unique(data.LESSONS.map((l) => l.slug), 'lekcje');
  unique(data.TOOLS.map((t) => t.id), 'narzędzia');
  unique(data.SITUATIONS.map((s) => s.id), 'nawigator');
  unique(data.SCENARIOS.map((s) => s.id), 'scenariusze');
  unique(data.CHALLENGES.map((c) => c.id), 'wyzwania');
  unique(data.FLASHCARDS.map((c) => c.id), 'fiszki');
  unique(data.AREAS.map((a) => a.slug), 'obszary');

  for (const l of data.LESSONS) {
    if (!modules.has(l.module)) problems.push(`lekcja ${l.slug}: brak modułu ${l.module}`);
    l.related.forEach((r) => lesson(r, `lekcja ${l.slug} (powiązane)`));
    if (l.related.includes(l.slug)) problems.push(`lekcja ${l.slug} wskazuje samą siebie`);
    tool(l.tool, `lekcja ${l.slug}`);
  }
  for (const t of data.TOOLS) lesson(t.lesson, `narzędzie ${t.id}`);
  for (const [id, j] of Object.entries(data.JOURNALS)) {
    tool(id, 'dziennik');
    lesson(j.lesson, `dziennik ${id}`);
  }
  for (const d of data.PROGRAM_DAYS) {
    lesson(d.lesson, `program dzień ${d.day}`);
    tool(d.tool, `program dzień ${d.day}`);
  }
  assert.deepEqual(data.PROGRAM_DAYS.map((d) => d.day), Array.from({ length: data.PROGRAM_DAYS.length }, (_, i) => i + 1));
  for (const q of data.QUIZ) {
    lesson(q.lesson, `quiz „${q.question.slice(0, 30)}”`);
    if (!modules.has(q.module)) problems.push(`quiz: brak modułu ${q.module}`);
    if (!(q.correct >= 0 && q.correct < q.options.length)) problems.push(`quiz „${q.question.slice(0, 30)}”: zły indeks odpowiedzi`);
  }
  for (const g of data.GLOSSARY) lesson(g.lesson, `słownik ${g.term}`);
  for (const c of data.CHALLENGES) {
    lesson(c.lesson, `wyzwanie ${c.id}`);
    tool(c.tool, `wyzwanie ${c.id}`);
  }
  for (const s of data.SITUATIONS) {
    s.lessons.forEach((l) => lesson(l, `nawigator ${s.id}`));
    s.tools.forEach((t) => tool(t, `nawigator ${s.id}`));
    if (!s.keywords.length) problems.push(`nawigator ${s.id}: brak słów kluczowych`);
  }
  for (const a of data.AREAS) {
    a.principles.forEach((p) => lesson(p.lesson, `obszar ${a.slug}`));
    a.tools.forEach((t) => tool(t, `obszar ${a.slug}`));
  }
  for (const s of data.SCENARIOS) {
    if (!s.area.trim()) problems.push(`scenariusz ${s.id}: brak etykiety obszaru`);
    s.options.forEach((o) => lesson(o.lesson, `scenariusz ${s.id}`));
    if (!s.options.some((o) => o.verdict === 'najlepsza')) problems.push(`scenariusz ${s.id}: brak najlepszej odpowiedzi`);
  }
  for (const f of data.FLASHCARDS) lesson(f.lesson, `fiszka ${f.id}`);
  assert.deepEqual(problems, []);
});

test('strony do wyszukiwarek i powłoki aplikacji się nie pokrywają', () => {
  const pages = data.seo.getPrerenderPages();
  const shells = new Set(data.seo.getShellPaths());
  unique(pages.map((p) => p.path), 'strony');
  const problems = [];
  for (const p of pages) {
    if (!p.path.endsWith('/')) problems.push(`${p.path}: brak ukośnika na końcu`);
    if (shells.has(p.path)) problems.push(`${p.path}: jednocześnie strona i powłoka`);
    if (p.description.length < 50 || p.description.length > 160) problems.push(`${p.path}: opis ma ${p.description.length} znaków`);
    if (p.title.length > 110) problems.push(`${p.path}: tytuł ma ${p.title.length} znaków`);
  }
  assert.deepEqual(problems, []);
  const knowledge = data.seo.buildKnowledge();
  assert.equal(knowledge.lessons.length, data.LESSONS.length);
  assert.ok(knowledge.lessons.every((l) => l.keywords.length > 10));
});
