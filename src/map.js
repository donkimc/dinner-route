import * as Leaflet from "leaflet";
import { pointAlong, sliceLine } from "./geo.js";

const L = Leaflet.default ?? Leaflet;

const PICKER_CENTER = [37.5345, 127.1307];

export function createInviteMap(container) {
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: true,
  }).setView(PICKER_CENTER, 13.6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const startMarker = L.marker(PICKER_CENTER, {
    icon: pinIcon("1", "", "pin--dinner"),
    zIndexOffset: 800,
  }).addTo(map);
  const endMarker = L.marker(PICKER_CENTER, {
    icon: pinIcon("2", "", "pin--coffee"),
    zIndexOffset: 800,
  }).addTo(map);
  const walker = L.marker(PICKER_CENTER, {
    icon: L.divIcon({
      className: "walker-wrap",
      html: `<div class="walker"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
    opacity: 0,
    zIndexOffset: 900,
  }).addTo(map);

  const ghostLine = L.polyline([], {
    color: "#c4923a",
    weight: 7,
    opacity: 0.95,
    lineCap: "round",
    lineJoin: "round",
  }).addTo(map);
  const drawnLine = L.polyline([], {
    color: "#6b3d12",
    weight: 5,
    opacity: 1,
    lineCap: "round",
    lineJoin: "round",
  }).addTo(map);

  hidePins();
  requestAnimationFrame(() => map.invalidateSize());
  window.addEventListener("resize", () => map.invalidateSize());

  const api = {
    map,
    coords: [],
    startLatLng: PICKER_CENTER,
    endLatLng: PICKER_CENTER,
    async loadRoute(route) {
      const response = await fetch(route.routeUrl);
      if (!response.ok) {
        throw new Error(`Could not load ${route.routeUrl}`);
      }
      const geo = await response.json();
      api.coords = geo.features[0].geometry.coordinates;
      api.startLatLng = ll(route.start.lng, route.start.lat);
      api.endLatLng = ll(route.end.lng, route.end.lat);

      setPinLabel(startMarker, "1", route.start.name, "pin--dinner");
      setPinLabel(endMarker, "2", route.end.name, "pin--coffee");
      startMarker.setLatLng(api.startLatLng).setOpacity(1);
      endMarker.setLatLng(api.endLatLng).setOpacity(1);
      walker.setLatLng(ll(api.coords[0][0], api.coords[0][1])).setOpacity(0);

      const latlngs = api.coords.map(([lng, lat]) => [lat, lng]);
      ghostLine.setLatLngs(latlngs);
      drawnLine.setLatLngs([]);
      ghostLine.bringToFront();
      startMarker.setZIndexOffset(1000);
      endMarker.setZIndexOffset(1000);
      api.walkZoom = walkZoomFor(map, api.startLatLng, api.endLatLng);
      api.setActivePin("none");
      map.invalidateSize();
      fitRoute(map, api.startLatLng, api.endLatLng, true);
    },
    showPickerView() {
      hidePins();
      ghostLine.setLatLngs([]);
      drawnLine.setLatLngs([]);
      map.flyTo(PICKER_CENTER, 13.6, { duration: 0.8 });
    },
    setLineProgress(t) {
      if (!api.coords.length) return;
      const sliced = sliceLine(api.coords, t);
      drawnLine.setLatLngs(sliced.map(([lng, lat]) => [lat, lng]));
      const { coord } = pointAlong(api.coords, t);
      walker.setLatLng(ll(coord[0], coord[1]));
    },
    followWalker(t) {
      if (!api.coords.length) return;
      const { coord } = pointAlong(api.coords, t);
      map.setView(ll(coord[0], coord[1]), api.walkZoom ?? 17, { animate: false });
    },
    showWalker(show) {
      walker.setOpacity(show ? 1 : 0);
    },
    setActivePin(which) {
      const startEl = startMarker.getElement();
      const endEl = endMarker.getElement();
      startEl?.querySelector(".pin")?.classList.toggle("is-active", which === "start" || which === "both");
      endEl?.querySelector(".pin")?.classList.toggle("is-active", which === "end" || which === "both");
    },
    flyToStart() {
      api.setActivePin("none");
      fitRoute(map, api.startLatLng, api.endLatLng, true);
    },
    flyToEnd() {
      api.setActivePin("end");
      fitRoute(map, api.startLatLng, api.endLatLng, true);
    },
    flyToOverview() {
      api.setActivePin("both");
      fitRoute(map, api.startLatLng, api.endLatLng, true);
    },
    jumpOverview() {
      api.setActivePin("both");
      api.setLineProgress(1);
      api.showWalker(false);
      fitRoute(map, api.startLatLng, api.endLatLng, false);
    },
  };

  function hidePins() {
    startMarker.setOpacity(0);
    endMarker.setOpacity(0);
    walker.setOpacity(0);
  }

  return api;
}

function routeSpan(map, start, end) {
  return map.distance(start, end);
}

function walkZoomFor(map, start, end) {
  return routeSpan(map, start, end) < 120 ? 19 : 17;
}

function fitRoute(map, start, end, animate) {
  const short = routeSpan(map, start, end) < 120;
  map.fitBounds(L.latLngBounds([start, end]).pad(short ? 0.15 : 0.35), {
    animate,
    duration: 0.9,
    maxZoom: short ? 19 : 17,
    padding: short ? [36, 36] : [80, 80],
  });
}

function ll(lng, lat) {
  return [lat, lng];
}

function pinIcon(num, label, extra) {
  return L.divIcon({
    className: "pin-wrap leaflet-div-icon",
    html: `<div class="pin ${extra}"><span class="pin__num">${num}</span><em class="pin__label">${label}</em></div>`,
    iconSize: [180, 72],
    iconAnchor: [90, 68],
  });
}

function setPinLabel(marker, num, label, extra) {
  marker.setIcon(pinIcon(num, label, extra));
}
