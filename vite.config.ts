import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH pozwala zbudować serwis do podkatalogu (np. /transerfing/). Domyślnie: katalog główny domeny.
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');

export default defineConfig(({ isSsrBuild }) => ({
  base,
  plugins: [react()],
  publicDir: isSsrBuild ? false : 'public',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    emptyOutDir: true,
  },
}));
