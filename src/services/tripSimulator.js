import { CAMPUS_STOPS, MOCK_SHUTTLES } from '../data/mockShuttles';

export const SIMULATION_TICK_MS = 250;
export const DEFAULT_SIMULATION_SPEED = 2;
const STOP_SNAP_TOLERANCE_METERS = 180;
const EARTH_RADIUS_METERS = 6_371_000;

// Routes are views over the existing shuttle mock records: no route geometry is duplicated.
const ROUTES = MOCK_SHUTTLES
  .filter((shuttle) => Array.isArray(shuttle.polyline) && shuttle.polyline.length > 1)
  .map((shuttle) => ({
    id: shuttle.id,
    label: shuttle.routeFullName || shuttle.route,
    route: shuttle.route,
    routeFullName: shuttle.routeFullName,
    polyline: shuttle.polyline
  }));

export function getRouteOptions() {
  return ROUTES;
}

export function getRouteById(routeId) {
  return ROUTES.find((route) => route.id === routeId) || null;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceBetween([lat1, lon1], [lat2, lon2]) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function routeSegments(polyline) {
  let distance = 0;
  return polyline.slice(0, -1).map((point, index) => {
    const next = polyline[index + 1];
    const length = distanceBetween(point, next);
    const segment = { start: point, end: next, startDistance: distance, length };
    distance += length;
    return segment;
  });
}

function routeLength(polyline) {
  return routeSegments(polyline).reduce((length, segment) => length + segment.length, 0);
}

function interpolatePoint(polyline, requestedDistance) {
  if (!polyline?.length) return { latitude: 0, longitude: 0, heading: 0 };
  if (polyline.length === 1) {
    return { latitude: polyline[0][0], longitude: polyline[0][1], heading: 0 };
  }

  const segments = routeSegments(polyline);
  const totalDistance = segments.reduce((sum, segment) => sum + segment.length, 0);
  const distance = Math.max(0, Math.min(requestedDistance, totalDistance));
  const segment = segments.find((item) => distance <= item.startDistance + item.length) || segments.at(-1);
  const fraction = segment.length === 0 ? 0 : (distance - segment.startDistance) / segment.length;
  const latitude = segment.start[0] + (segment.end[0] - segment.start[0]) * fraction;
  const longitude = segment.start[1] + (segment.end[1] - segment.start[1]) * fraction;
  const y = Math.sin(toRadians(segment.end[1] - segment.start[1])) * Math.cos(toRadians(segment.end[0]));
  const x =
    Math.cos(toRadians(segment.start[0])) * Math.sin(toRadians(segment.end[0])) -
    Math.sin(toRadians(segment.start[0])) *
      Math.cos(toRadians(segment.end[0])) *
      Math.cos(toRadians(segment.end[1] - segment.start[1]));
  const heading = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  return { latitude, longitude, heading };
}

function projectPointToRoute(point, polyline) {
  const segments = routeSegments(polyline);
  let closest = null;
  const latitudeScale = 111_132;
  const longitudeScale = 111_320 * Math.cos(toRadians(point[0]));
  const pointX = point[1] * longitudeScale;
  const pointY = point[0] * latitudeScale;

  for (const segment of segments) {
    const startX = segment.start[1] * longitudeScale;
    const startY = segment.start[0] * latitudeScale;
    const endX = segment.end[1] * longitudeScale;
    const endY = segment.end[0] * latitudeScale;
    const dx = endX - startX;
    const dy = endY - startY;
    const denominator = dx * dx + dy * dy;
    const fraction = denominator === 0
      ? 0
      : Math.max(0, Math.min(1, ((pointX - startX) * dx + (pointY - startY) * dy) / denominator));
    const projected = [
      segment.start[0] + (segment.end[0] - segment.start[0]) * fraction,
      segment.start[1] + (segment.end[1] - segment.start[1]) * fraction
    ];
    const distanceFromRoute = distanceBetween(point, projected);

    if (!closest || distanceFromRoute < closest.distanceFromRoute) {
      closest = {
        offsetMeters: segment.startDistance + segment.length * fraction,
        distanceFromRoute
      };
    }
  }

  return closest;
}

function shortStopName(name) {
  return name
    .replace(/\s*&.*$/, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
}

function getRouteStops(route) {
  if (!route?.polyline?.length) return [];

  return CAMPUS_STOPS
    .map((stop) => {
      const projection = projectPointToRoute([stop.latitude, stop.longitude], route.polyline);
      return projection && projection.distanceFromRoute <= STOP_SNAP_TOLERANCE_METERS
        ? { ...stop, shortName: shortStopName(stop.name), offsetMeters: projection.offsetMeters }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.offsetMeters - b.offsetMeters)
    .filter((stop, index, list) => index === 0 || stop.id !== list[index - 1].id);
}

function parseSpeedKmh(speed) {
  const parsed = Number.parseFloat(String(speed || '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
}

function formatEtaSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Arriving';
  if (seconds < 60) return `${Math.max(1, Math.ceil(seconds))} sec`;
  return `${Math.ceil(seconds / 60)} min`;
}

function formatDistance(meters) {
  const safeMeters = Math.max(0, meters);
  return safeMeters >= 1_000
    ? `${(safeMeters / 1_000).toFixed(1)} km away`
    : `${Math.round(safeMeters)} m away`;
}

function buildTripSnapshot(shuttle, trip, route, progressMeters, active) {
  const totalDistanceMeters = routeLength(route.polyline);
  const progress = Math.max(0, Math.min(progressMeters, totalDistanceMeters));
  const position = interpolatePoint(route.polyline, progress);
  const speedKmh = trip.baseSpeedKmh * trip.speedMultiplier;
  const metersPerSecond = (speedKmh * 1_000) / 3_600;
  const routeStops = getRouteStops(route);
  const passedStops = routeStops.filter((stop) => stop.offsetMeters <= progress + 2);
  const currentStop = passedStops.at(-1) || null;
  const nextStop = routeStops.find((stop) => stop.offsetMeters > progress + 2) || null;
  const destination = nextStop || routeStops.at(-1) || null;
  const etaSeconds = destination
    ? Math.max(0, destination.offsetMeters - progress) / metersPerSecond
    : Math.max(0, totalDistanceMeters - progress) / metersPerSecond;
  const tripStatus = active ? 'ACTIVE' : (progress >= totalDistanceMeters ? 'COMPLETED' : 'STOPPED');
  const stops = routeStops.map((stop) => {
    const isPassed = stop.offsetMeters <= progress + 2;
    const secondsToStop = Math.max(0, stop.offsetMeters - progress) / metersPerSecond;
    return {
      ...stop,
      status: isPassed ? 'passed' : stop.id === nextStop?.id ? 'current' : 'upcoming',
      eta: isPassed ? 'Passed' : formatEtaSeconds(secondsToStop),
      distance: isPassed ? 'Passed' : formatDistance(stop.offsetMeters - progress),
      isTarget: stop.id === nextStop?.id
    };
  });

  return {
    ...shuttle,
    status: active ? 'ON ROUTE' : shuttle.status,
    latitude: position.latitude,
    longitude: position.longitude,
    heading: position.heading,
    route: route.route,
    routeFullName: route.routeFullName,
    speed: active ? `${Math.round(speedKmh)} km/h` : trip.originalSpeed,
    nextStop: nextStop?.shortName || (progress >= totalDistanceMeters ? 'Arrived' : routeStops.at(-1)?.shortName || 'Route end'),
    eta: progress >= totalDistanceMeters ? 'Arrived' : formatEtaSeconds(etaSeconds),
    etaMinutes: progress >= totalDistanceMeters ? 0 : etaSeconds / 60,
    stops,
    trip: {
      ...trip,
      active,
      status: tripStatus,
      progressMeters: progress,
      totalDistanceMeters,
      progressPercent: totalDistanceMeters > 0 ? Math.round((progress / totalDistanceMeters) * 100) : 0,
      currentStop: currentStop?.shortName || 'Route start',
      nextStop: nextStop?.shortName || 'Arrived',
      speedKmh,
      etaSeconds
    }
  };
}

function startTrip(shuttle, routeId, speedMultiplier, now) {
  const route = getRouteById(routeId) || getRouteById(shuttle.id);
  if (!route) return shuttle;

  const trip = {
    routeId: route.id,
    active: true,
    status: 'ACTIVE',
    startedAt: now,
    speedMultiplier: [1, 2, 4].includes(speedMultiplier) ? speedMultiplier : DEFAULT_SIMULATION_SPEED,
    baseSpeedKmh: parseSpeedKmh(shuttle.speed),
    originalSpeed: shuttle.speed || '0 km/h',
    originalStatus: shuttle.status
  };

  return buildTripSnapshot(shuttle, trip, route, 0, true);
}

function advanceTrip(shuttle, deltaMs) {
  if (!shuttle.trip?.active) return shuttle;
  const route = getRouteById(shuttle.trip.routeId);
  if (!route) return shuttle;

  const totalDistanceMeters = routeLength(route.polyline);
  const metersPerSecond = (shuttle.trip.baseSpeedKmh * shuttle.trip.speedMultiplier * 1_000) / 3_600;
  const nextProgress = shuttle.trip.progressMeters + (metersPerSecond * Math.max(0, deltaMs)) / 1_000;
  const completed = nextProgress >= totalDistanceMeters;
  const updated = buildTripSnapshot(shuttle, shuttle.trip, route, nextProgress, !completed);

  return {
    ...updated,
    status: completed ? shuttle.trip.originalStatus : 'ON ROUTE'
  };
}

function stopTrip(shuttle) {
  if (!shuttle.trip?.active) return shuttle;
  const route = getRouteById(shuttle.trip.routeId);
  if (!route) return shuttle;
  const updated = buildTripSnapshot(shuttle, shuttle.trip, route, shuttle.trip.progressMeters, false);
  return { ...updated, status: shuttle.trip.originalStatus };
}

export function estimateArrivalAtStop(shuttle, stop) {
  if (!shuttle?.trip?.active || !stop) return null;
  const route = getRouteById(shuttle.trip.routeId);
  if (!route) return null;

  const projection = projectPointToRoute([stop.latitude, stop.longitude], route.polyline);
  if (!projection || projection.distanceFromRoute > STOP_SNAP_TOLERANCE_METERS) return null;
  const remainingMeters = projection.offsetMeters - shuttle.trip.progressMeters;
  if (remainingMeters <= 2) return null;

  const metersPerSecond =
    (shuttle.trip.baseSpeedKmh * shuttle.trip.speedMultiplier * 1_000) / 3_600;
  const etaSeconds = Math.max(0, remainingMeters / metersPerSecond);

  return {
    eta: formatEtaSeconds(etaSeconds),
    etaSeconds,
    etaMinutes: etaSeconds / 60,
    remainingMeters
  };
}

export function transitReducer(shuttles, action) {
  switch (action.type) {
    case 'start-trip':
      return shuttles.map((shuttle) =>
        shuttle.id === action.vehicleId
          ? startTrip(shuttle, action.routeId, action.speedMultiplier, action.now)
          : shuttle
      );
    case 'stop-trip':
      return shuttles.map((shuttle) =>
        shuttle.id === action.vehicleId ? stopTrip(shuttle) : shuttle
      );
    case 'tick': {
      let changed = false;
      const next = shuttles.map((shuttle) => {
        const updated = advanceTrip(shuttle, action.deltaMs);
        if (updated !== shuttle) changed = true;
        return updated;
      });
      return changed ? next : shuttles;
    }
    case 'refresh':
      return shuttles.map((shuttle) => {
        if (shuttle.trip?.active) return shuttle;
        const offset = action.offsets?.[shuttle.id];
        return offset
          ? { ...shuttle, latitude: shuttle.latitude + offset.latitude, longitude: shuttle.longitude + offset.longitude }
          : shuttle;
      });
    default:
      return shuttles;
  }
}
