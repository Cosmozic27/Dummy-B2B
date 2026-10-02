const ROUTER_URL = 'https://router.project-osrm.org/route/v1/driving';
const REQUEST_TIMEOUT_MS = 8000;
const routeCache = new Map();

function readCoordinate(stop, field, alternate) {
  return Number(stop?.[field] ?? stop?.[alternate]);
}

function toPoint(stop) {
  return [readCoordinate(stop, 'lat', 'latitude'), readCoordinate(stop, 'lng', 'longitude')];
}

function makeDirectSegments(stops) {
  return stops.slice(0, -1).map((stop, index) => [toPoint(stop), toPoint(stops[index + 1])]);
}

function routeKey(stops) {
  return stops.map((stop) => {
    const [lat, lng] = toPoint(stop);
    return `${stop.id || ''}:${lat.toFixed(6)},${lng.toFixed(6)}`;
  }).join('|');
}

function geometryToLatLng(geometry) {
  const points = [];
  for (const coordinate of geometry || []) {
    const [lng, lat] = coordinate.map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const previous = points.at(-1);
    if (!previous || Math.abs(previous[0] - lat) > 1e-7 || Math.abs(previous[1] - lng) > 1e-7) {
      points.push([lat, lng]);
    }
  }
  return points;
}

async function requestRoadSegments(stops) {
  const coordinates = stops.map((stop) => {
    const [lat, lng] = toPoint(stop);
    return `${lng},${lat}`;
  }).join(';');
  const url = `${ROUTER_URL}/${coordinates}?steps=true&overview=false&geometries=geojson&alternatives=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Road router returned ${response.status}.`);
    const data = await response.json();
    const legs = data.routes?.[0]?.legs;
    if (data.code !== 'Ok' || !Array.isArray(legs) || legs.length !== stops.length - 1) {
      throw new Error('Road router did not return a path for each stop pair.');
    }

    const segments = legs.map((leg) => {
      const coordinatesForLeg = (leg.steps || []).flatMap((step) => step.geometry?.coordinates || []);
      const points = geometryToLatLng(coordinatesForLeg);
      if (points.length < 2) throw new Error('Road router returned an incomplete road segment.');
      return points;
    });

    return { segments, source: 'road' };
  } finally {
    clearTimeout(timeout);
  }
}

export function getRoadRouteGeometry(routeStops) {
  const stops = (routeStops || []).filter((stop) => {
    const [lat, lng] = toPoint(stop);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });
  const directSegments = makeDirectSegments(stops);
  if (stops.length < 2) return Promise.resolve({ segments: directSegments, source: 'direct' });

  const key = routeKey(stops);
  const cached = routeCache.get(key);
  if (cached) return cached;

  const request = requestRoadSegments(stops).catch((error) => {
    routeCache.delete(key);
    console.warn('Road routing unavailable; using existing stop-to-stop path.', error);
    return { segments: directSegments, source: 'direct' };
  });
  routeCache.set(key, request);
  return request;
}
