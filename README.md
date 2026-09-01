# Dinner Route

A static invitation page for two walking dinners in Gangdong, Seoul. Guests pick a course; the map zooms to the stops and GSAP plays the story.

## Courses

1. **저녁 & 커피** — [상록분식](https://naver.me/5gFgYdWQ) → [채스우드커피](https://naver.me/FFGMoP5l) (~380 m, Seongnae-dong)
2. **냉면 & 돼지고기** — [송월냉면](https://naver.me/FK5vf06T) → [깡돈 천호점](https://naver.me/FV7YsX9f) (~30 m, Cheonho-dong)

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`).

```bash
npm run build    # output in dist/
npm run preview  # serve the production build
```

## Live site

GitHub Pages is serving this repo as a **project site**. The committed root `index.html` + `assets/` must be the **Vite production build** (not the source file that links `/src/style.css`).

`npm run build:pages` writes that build to both `docs/` and the repo root, so either Pages folder works:

- Branch **main**, folder **/** (root), or
- Branch **main**, folder **/docs**

Site: https://donkimc.github.io/dinner-route/

Edit the page in `src/index.html`. Do not hand-edit the root `index.html`.

No API keys. The map uses OpenStreetMap tiles via Leaflet.

## Edit copy and routes

All course text, coordinates, Naver links, and photos live in [`src/content.js`](src/content.js). Walking paths are GeoJSON in [`public/route.geojson`](public/route.geojson) and [`public/route-naengmyeon.geojson`](public/route-naengmyeon.geojson) (`[lng, lat]`).

Show at most one photo per stop. Omit the photo field if there is no listing image.

Date copy is in the `shared` object in `src/content.js`.
