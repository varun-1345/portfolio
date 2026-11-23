# Varun Varma Nampally — Portfolio

Personal portfolio built with **Vite + TypeScript + Three.js**, styled after **Material 3**
(Google Sans Flex, tonal surfaces, light/dark themes, M3 motion curves).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve dist/ locally
```

## Edit content

All copy lives in [`src/content.ts`](src/content.ts) — profile, about, projects, experience,
skills, education. No markup changes needed for text edits.

Theme colours are CSS custom properties at the top of [`src/style.css`](src/style.css);
the 3D palette is in `PALETTES` inside [`src/scene.ts`](src/scene.ts).

## Deploy (GitHub Pages)

1. Create a GitHub repo and push this folder to `main`.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push.

The build sets `VITE_BASE=/<repo-name>/` automatically. If the repo is a *user site*
(`<user>.github.io`), change that env to `/`.

## Structure

```
index.html            fonts, meta, theme pre-paint script
src/main.ts           renders sections, wires theme toggle + 3D scene
src/scene.ts          Three.js hero: morphing sculpture + orbiting shapes
src/noise.ts          simplex noise for the sculpture
src/interactions.ts   ripple, scroll-reveal, nav highlighting, theme persistence
src/style.css         Material 3 tokens, type scale, components
src/content.ts        all portfolio copy
```
