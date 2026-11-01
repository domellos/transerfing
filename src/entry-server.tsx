import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { preloadAll } from './routes';
import { ROUTER_BASENAME } from './site';

export { getPrerenderPages, getShellPaths, buildKnowledge } from './seo';
export { PRIVATE, STATIC } from './site';

/** Renderuje stronę do HTML w czasie budowania (dla wyszukiwarek i szybkiego pierwszego widoku). */
export async function render(path: string): Promise<string> {
  await preloadAll();
  const location = ROUTER_BASENAME === '/' ? path : ROUTER_BASENAME + path;
  return renderToString(
    <StaticRouter basename={ROUTER_BASENAME} location={location}>
      <App />
    </StaticRouter>,
  );
}
