export function lineLength(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1], coords[i]);
  }
  return total;
}

export function pointAlong(coords, t) {
  const target = Math.max(0, Math.min(1, t)) * lineLength(coords);
  if (target <= 0) {
    return { coord: coords[0], bearing: bearing(coords[0], coords[1] ?? coords[0]) };
  }

  let traveled = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const seg = haversine(a, b);
    if (traveled + seg >= target || i === coords.length - 1) {
      const u = seg === 0 ? 0 : (target - traveled) / seg;
      return {
        coord: lerp(a, b, u),
        bearing: bearing(a, b),
      };
    }
    traveled += seg;
  }

  const last = coords[coords.length - 1];
  const prev = coords[coords.length - 2] ?? last;
  return { coord: last, bearing: bearing(prev, last) };
}

export function sliceLine(coords, t) {
  const target = Math.max(0, Math.min(1, t)) * lineLength(coords);
  if (t <= 0) return [coords[0], coords[0]];
  if (t >= 1) return coords;

  const out = [coords[0]];
  let traveled = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const seg = haversine(a, b);
    if (traveled + seg >= target) {
      const u = seg === 0 ? 0 : (target - traveled) / seg;
      out.push(lerp(a, b, u));
      return out;
    }
    out.push(b);
    traveled += seg;
  }
  return coords;
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function haversine(a, b) {
  const R = 6371000;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function bearing(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function rad(d) {
  return (d * Math.PI) / 180;
}
