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

function measurePolyline(points) {
  const segmentLengths = [];
  let totalKm = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const [lat1, lng1] = points[index];
    const [lat2, lng2] = points[index + 1];
    const length = distanceKm(lat1, lng1, lat2, lng2);
    segmentLengths.push(length);
    totalKm += length;
  }
  return { segmentLengths, totalKm };
}

function projectPositionOnSegment(position, start, end) {
  const latitudeScale = 111.32;
  const longitudeScale = latitudeScale * Math.cos((position[0] * Math.PI) / 180);
  const dx = (end[1] - start[1]) * longitudeScale;
  const dy = (end[0] - start[0]) * latitudeScale;
  const px = (position[1] - start[1]) * longitudeScale;
  const py = (position[0] - start[0]) * latitudeScale;
  const denominator = (dx * dx) + (dy * dy);
  const fraction = denominator > 0
    ? Math.max(0, Math.min(1, ((px * dx) + (py * dy)) / denominator))
    : 0;
  const point = [start[0] + ((end[0] - start[0]) * fraction), start[1] + ((end[1] - start[1]) * fraction)];
  return { fraction, point, distance: distanceKm(position[0], position[1], point[0], point[1]) };
}

function distanceAlongPolyline(points, position, segmentLengths) {
  let bestDistance = Infinity;
  let bestProgress = 0;
  let completedKm = 0;
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const projection = projectPositionOnSegment(position, points[index], points[index + 1]);
    if (projection.distance < bestDistance) {
      bestDistance = projection.distance;
      bestProgress = completedKm + (segmentLengths[index] * projection.fraction);
    }
    completedKm += segmentLengths[index];
  }
  return bestProgress;
}

function pointAtPolylineDistance(points, segmentLengths, targetKm) {
  let remainingKm = targetKm;
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remainingKm <= length || index === segmentLengths.length - 1) {
      const fraction = length > 0 ? Math.max(0, Math.min(1, remainingKm / length)) : 0;
      return [
        points[index][0] + ((points[index + 1][0] - points[index][0]) * fraction),
        points[index][1] + ((points[index + 1][1] - points[index][1]) * fraction),
      ];
    }
    remainingKm -= length;
  }
  return points.at(-1);
}

function advanceOnRoadSegment(vehicle, path, speedKmh, elapsedMs, nextStopIndex, routeLength) {
  const points = path.filter((point) => Array.isArray(point) && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])))
    .map((point) => [Number(point[0]), Number(point[1])]);
  if (points.length < 2) return null;

  const { segmentLengths, totalKm } = measurePolyline(points);
  if (totalKm <= 0) return null;
  const progressKm = distanceAlongPolyline(points, [Number(vehicle.lat), Number(vehicle.lng)], segmentLengths);
  const stepKm = (speedKmh * Math.max(0, elapsedMs)) / 3_600_000;
  const nextDistanceKm = progressKm + stepKm;
  if (nextDistanceKm >= totalKm) {
    const endpoint = points.at(-1);
    return { lat: endpoint[0], lng: endpoint[1], nextStopIndex: (nextStopIndex + 1) % routeLength };
  }

  const [lat, lng] = pointAtPolylineDistance(points, segmentLengths, nextDistanceKm);
  return { lat, lng, nextStopIndex };
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

export function advanceVehicleAlongRoute(vehicle, route, allStops, elapsedMs = SIMULATION_TICK_MS, roadSegments = null) {
  const routeStops = getRouteStops(route, allStops);
  const speedKmh = Number(vehicle?.speed);
  const lat = Number(vehicle?.lat);
  const lng = Number(vehicle?.lng);

  if (routeStops.length < 2 || !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(speedKmh) || speedKmh <= 0) {
    return null;
  }

  const nextStopIndex = ((Math.trunc(Number(vehicle.nextStopIndex) || 0) % routeStops.length) + routeStops.length) % routeStops.length;
  const previousIndex = (nextStopIndex - 1 + routeStops.length) % routeStops.length;
  const roadMovement = advanceOnRoadSegment(
    vehicle,
    roadSegments?.[previousIndex],
    speedKmh,
    elapsedMs,
    nextStopIndex,
    routeStops.length,
  );
  if (roadMovement) return roadMovement;

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
