import { defineConfig } from 'vite';

// For GitHub Pages project sites, set VITE_BASE to "/<repo-name>/" in CI.
// Defaults to "/" for local dev and user/org sites (<user>.github.io).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
