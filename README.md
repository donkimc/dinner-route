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

GitHub Pages must publish the **built** site, not the Vite source `index.html` in the repo root.

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/docs**
4. Save, then open https://donkimc.github.io/dinner-route/

`npm run build:pages` rebuilds `docs/` after you change the app.

Alternatively, Source: **GitHub Actions** (workflow in `.github/workflows/pages.yml`).

No API keys. The map uses OpenStreetMap tiles via Leaflet.

## Edit copy and routes

All course text, coordinates, Naver links, and photos live in [`src/content.js`](src/content.js). Walking paths are GeoJSON in [`public/route.geojson`](public/route.geojson) and [`public/route-naengmyeon.geojson`](public/route-naengmyeon.geojson) (`[lng, lat]`).

Show at most one photo per stop. Omit the photo field if there is no listing image.

Date copy is in the `shared` object in `src/content.js`.
