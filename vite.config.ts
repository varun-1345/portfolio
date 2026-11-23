import { defineConfig } from 'vite';

// For GitHub Pages project sites, set VITE_BASE to "/<repo-name>/" in CI.
// Defaults to "/" for local dev and user/org sites (<user>.github.io).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  // Local-only: allow the cloudtop proxy hostnames when previewing from a browser.
  preview: { allowedHosts: true },
  server: { allowedHosts: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
