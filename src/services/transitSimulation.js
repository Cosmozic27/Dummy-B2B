export const SIMULATION_TICK_MS = 1000;
export const DEFAULT_SIMULATION_SPEED_KMH = 20;

const EARTH_RADIUS_KM = 6371;

export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function getRouteStops(route, allStops) {
  if (!route?.stopIds?.length) return [];
  const byId = new Map(allStops.map((stop) => [stop.id, stop]));
  return route.stopIds.map((stopId) => byId.get(stopId)).filter(Boolean);
}

export function createTripStartPatch(route, allStops, speedKmh = DEFAULT_SIMULATION_SPEED_KMH) {
  const routeStops = getRouteStops(route, allStops);
  if (!route?.id || routeStops.length < 2) {
    throw new Error('The selected route must contain at least two existing campus stops.');
  }

  const origin = routeStops[0];
  const numericSpeed = Number(speedKmh);
  if (!Number.isFinite(numericSpeed) || numericSpeed <= 0) {
    throw new Error('Select a valid simulation speed.');
  }

  return {
    routeId: route.id,
    lat: Number(origin.lat),
    lng: Number(origin.lng),
    nextStopIndex: 1 % routeStops.length,
    status: 'active',
    speed: numericSpeed,
  };
}

export function advanceVehicleAlongRoute(vehicle, route, allStops, elapsedMs = SIMULATION_TICK_MS) {
  const routeStops = getRouteStops(route, allStops);
  const speedKmh = Number(vehicle?.speed);
  const lat = Number(vehicle?.lat);
  const lng = Number(vehicle?.lng);

  if (routeStops.length < 2 || !Number.isFinite(lat) || !Number.isFinite(lng) || speedKmh <= 0) {
    return null;
  }

  const nextStopIndex = ((Math.trunc(Number(vehicle.nextStopIndex) || 0) % routeStops.length) + routeStops.length) % routeStops.length;
  const target = routeStops[nextStopIndex];
  const remainingKm = distanceKm(lat, lng, Number(target.lat), Number(target.lng));
  const stepKm = (speedKmh * Math.max(0, elapsedMs)) / 3_600_000;

  if (remainingKm <= stepKm || remainingKm === 0) {
    return {
      lat: Number(target.lat),
      lng: Number(target.lng),
      nextStopIndex: (nextStopIndex + 1) % routeStops.length,
    };
  }

  const fraction = stepKm / remainingKm;
  return {
    lat: lat + (Number(target.lat) - lat) * fraction,
    lng: lng + (Number(target.lng) - lng) * fraction,
    nextStopIndex,
  };
}

export function getRouteProgressPercent(vehicle, route, allStops) {
  const routeStops = getRouteStops(route, allStops);
  const lat = Number(vehicle?.lat);
  const lng = Number(vehicle?.lng);
  if (routeStops.length < 2 || !Number.isFinite(lat) || !Number.isFinite(lng)) return 0;

  const nextStopIndex = ((Math.trunc(Number(vehicle.nextStopIndex) || 0) % routeStops.length) + routeStops.length) % routeStops.length;
  const previousIndex = (nextStopIndex - 1 + routeStops.length) % routeStops.length;
  const routeLength = routeStops.reduce((total, stop, index) => {
    const next = routeStops[(index + 1) % routeStops.length];
    return total + distanceKm(Number(stop.lat), Number(stop.lng), Number(next.lat), Number(next.lng));
  }, 0);

  if (routeLength <= 0) return 0;

  let completedKm = 0;
  for (let index = 0; index < previousIndex; index += 1) {
    const current = routeStops[index];
    const next = routeStops[index + 1];
    completedKm += distanceKm(Number(current.lat), Number(current.lng), Number(next.lat), Number(next.lng));
  }

  const segmentStart = routeStops[previousIndex];
  const segmentEnd = routeStops[nextStopIndex];
  const segmentLength = distanceKm(Number(segmentStart.lat), Number(segmentStart.lng), Number(segmentEnd.lat), Number(segmentEnd.lng));
  const travelledOnSegment = Math.min(
    segmentLength,
    distanceKm(Number(segmentStart.lat), Number(segmentStart.lng), lat, lng),
  );

  return Math.max(0, Math.min(100, Math.round(((completedKm + travelledOnSegment) / routeLength) * 100)));
}
