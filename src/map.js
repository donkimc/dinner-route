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

  const startIcon = pinIcon("1", "", "pin--dinner");
  const endIcon = pinIcon("2", "", "pin--coffee");
  const walkerIcon = L.divIcon({
    className: "walker-wrap",
    html: `<div class="walker"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const startMarker = L.marker(PICKER_CENTER, { icon: startIcon, opacity: 0 }).addTo(map);
  const endMarker = L.marker(PICKER_CENTER, { icon: endIcon, opacity: 0 }).addTo(map);
  const walker = L.marker(PICKER_CENTER, { icon: walkerIcon, opacity: 0 }).addTo(map);
  const ghostLine = L.polyline([], {
    color: "#8a6a32",
    weight: 4,
    opacity: 0.5,
    dashArray: "6 8",
  }).addTo(map);
  const drawnLine = L.polyline([], {
    color: "#6b3d12",
    weight: 6,
    opacity: 0.95,
  }).addTo(map);

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
      ghostLine.setLatLngs(api.coords.map(([lng, lat]) => [lat, lng]));
      drawnLine.setLatLngs([]);
      api.setActivePin("both");
      map.invalidateSize();
      map.fitBounds(L.latLngBounds([api.startLatLng, api.endLatLng]).pad(0.45), {
        animate: true,
        duration: 0.8,
        maxZoom: 18,
        paddingTopLeft: [24, 72],
        paddingBottomRight: [24, 280],
      });
    },
    showPickerView() {
      startMarker.setOpacity(0);
      endMarker.setOpacity(0);
      walker.setOpacity(0);
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
      map.setView(ll(coord[0], coord[1]), 18, { animate: false });
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
      api.setActivePin("start");
      map.flyTo(api.startLatLng, 18, { duration: 1.2 });
    },
    flyToEnd() {
      api.setActivePin("end");
      map.flyTo(api.endLatLng, 18, { duration: 1.1 });
    },
    flyToOverview() {
      api.setActivePin("both");
      map.fitBounds(L.latLngBounds([api.startLatLng, api.endLatLng]).pad(0.45), {
        animate: true,
        duration: 1.1,
        maxZoom: 18,
        paddingTopLeft: [24, 72],
        paddingBottomRight: [24, 280],
      });
    },
    jumpOverview() {
      api.setActivePin("both");
      api.setLineProgress(1);
      api.showWalker(false);
      map.fitBounds(L.latLngBounds([api.startLatLng, api.endLatLng]).pad(0.45), {
        animate: false,
        maxZoom: 18,
        paddingTopLeft: [24, 72],
        paddingBottomRight: [24, 280],
      });
    },
  };

  return api;
}

function ll(lng, lat) {
  return [lat, lng];
}

function pinIcon(num, label, extra) {
  return L.divIcon({
    className: "pin-wrap",
    html: `<div class="pin ${extra}"><span class="pin__num">${num}</span><em class="pin__label">${label}</em></div>`,
    iconSize: [120, 48],
    iconAnchor: [60, 44],
  });
}

function setPinLabel(marker, num, label, extra) {
  marker.setIcon(pinIcon(num, label, extra));
}
