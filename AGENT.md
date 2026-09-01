# AGENT.md

Guidance for agents working in this repository.

## What this is

Vite + vanilla HTML/CSS/JS invitation. Guests choose one of two Gangdong walking courses; Leaflet shows the map; GSAP sequences overlay cards.

Do not convert this to React/Next unless asked. Keep it a single static page.

## Stack (do not regress)

- **Leaflet 1.9** for the map (OSM raster tiles). Do **not** switch back to MapLibre/WebGL unless explicitly requested — MapLibre 6 needs WebGL2 and previously left the map frozen or broke Vite’s optimizer.
- **GSAP** for the story timeline.
- CSS is loaded from `index.html` (`/src/style.css`) **and** imported in `src/main.js`. Keep the HTML `<link>` so the invitation still looks styled if JS fails.

Leaflet uses `[lat, lng]`. GeoJSON and `content.js` coordinates are `[lng, lat]`. Convert at the Leaflet boundary in `src/map.js` (`ll()`).

## Where to change things

| Change | File |
|--------|------|
| Titles, blurbs, highlights, coords, Naver URLs, photos | `src/content.js` |
| Picker labels in the first screen | `index.html` (`data-route` must match `routes[].id`) |
| Walk polyline | `public/route.geojson`, `public/route-naengmyeon.geojson` |
| Camera / markers / follow-walk | `src/map.js` |
| Card sequence timing | `src/timeline.js` |
| Wire picker → map → timeline | `src/main.js` |
| Look | `src/style.css` |

Adding a course: append to `routes` in `content.js`, add a picker button with the same `data-route` id, add a GeoJSON file, point `routeUrl` at it.

## Photos

At most **one** photo per stop. If Naver listing has no owner photo, omit `photo` (상록분식). Prefer local files under `public/photos/` or official listing CDN URLs. Do not scrape blog review photos.

## Map behavior

On course select, `loadRoute` must `fitBounds` both stops immediately so the map locates before the cover card plays. Then `flyToStart` / `followWalker` / `flyToEnd` / `flyToOverview`. If Leaflet init fails, `main.js` uses a stub so cards still play.

After showing `#story`, call `map.invalidateSize()`.

## Commands

```bash
npm install
npm run dev
npm run build
```

No backend, no map API keys. Ignore `node_modules`, `dist`, `.verify`.

## GitHub Pages

Deploy via `docs/` (committed Vite build, `base` `/dinner-route/`) or `.github/workflows/pages.yml`. Pages must **not** use the repo root — that serves source `index.html` and looks like unstyled HTML. After UI changes run `npm run build:pages` and commit `docs/`. Local asset URLs must use `import.meta.env.BASE_URL` (see `asset()` in `src/content.js`) so GitHub Pages under `/dinner-route/` can fetch GeoJSON and photos.
