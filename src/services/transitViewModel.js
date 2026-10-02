import { formatEta, getEta } from '../lib/eta.js';
import { distanceKm, getRouteProgressPercent, getRouteStops } from './transitSimulation.js';

function etaLabel(vehicle, stop, route, allStops, isMoving) {
  if (!isMoving || !stop || !route) return 'No ETA';
  try {
    return formatEta(getEta(vehicle, stop, route, allStops));
  } catch {
    return 'No ETA';
  }
}

function metersToStop(vehicle, stop) {
  const lat = Number(vehicle.lat);
  const lng = Number(vehicle.lng);
  if (!stop || !Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const meters = Math.round(distanceKm(lat, lng, Number(stop.lat), Number(stop.lng)) * 1000);
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km away` : `${meters} m away`;
}

export function toCampusStopView(stop) {
  return {
    ...stop,
    latitude: Number(stop.lat),
    longitude: Number(stop.lng),
    shortCode: stop.name?.slice(0, 3).toUpperCase() || 'STOP',
  };
}

export function toShuttleView(vehicle, routes, allStops) {
  const route = routes.find((candidate) => candidate.id === vehicle.routeId) || null;
  const routeStops = getRouteStops(route, allStops);
  const routeStopIds = route?.stopIds || [];
  const nextStopIndex = routeStopIds.length
    ? ((Math.trunc(Number(vehicle.nextStopIndex) || 0) % routeStopIds.length) + routeStopIds.length) % routeStopIds.length
    : -1;
  const previousIndex = routeStopIds.length ? (nextStopIndex - 1 + routeStopIds.length) % routeStopIds.length : -1;
  const nextStop = nextStopIndex >= 0 ? routeStops[nextStopIndex] : null;
  const currentStop = previousIndex >= 0 ? routeStops[previousIndex] : null;
  const isMoving = Number(vehicle.speed) > 0;
  const isDelayed = Boolean(vehicle.delayed);
  const status = isDelayed
    ? 'DELAYED'
    : isMoving
      ? 'ON ROUTE'
      : String(vehicle.status || 'ACTIVE').replace(/[_-]/g, ' ').toUpperCase();
  const routeName = route?.name || 'No route assigned';

  const displayStops = routeStops.map((stop, index) => {
    const isPassed = isMoving && index === previousIndex && index !== nextStopIndex;
    const isCurrent = index === nextStopIndex;
    const eta = isPassed ? 'Passed' : etaLabel(vehicle, stop, route, allStops, isMoving);
    const distance = isCurrent && isMoving ? metersToStop(vehicle, stop) : '';
    return {
      ...toCampusStopView(stop),
      status: isPassed ? 'passed' : isCurrent ? 'current' : 'upcoming',
      isTarget: isCurrent,
      eta,
      distance,
    };
  });

  const trip = isMoving && route
    ? {
        active: true,
        routeId: route.id,
        status: 'active',
        currentStop: currentStop?.name || 'En route',
        nextStop: nextStop?.name || 'Unknown stop',
        progressPercent: getRouteProgressPercent(vehicle, route, allStops),
      }
    : null;

  return {
    ...vehicle,
    id: vehicle.id,
    name: vehicle.name || vehicle.id,
    numberPlate: vehicle.id,
    latitude: Number(vehicle.lat),
    longitude: Number(vehicle.lng),
    routeId: route?.id || vehicle.routeId,
    routeFullName: routeName,
    route: routeStops.map((stop) => stop.name).join(' → ') || routeName,
    nextStop: nextStop?.name || 'No route assigned',
    eta: etaLabel(vehicle, nextStop, route, allStops, isMoving),
    speedKmh: Number(vehicle.speed) || 0,
    speed: `${Number(vehicle.speed) || 0} km/h`,
    crowding: vehicle.crowding || 'Not reported',
    occupancy: vehicle.crowding || '—',
    occupancyLabel: vehicle.crowding || 'Not reported',
    status,
    isDelayed,
    delayMinutes: Number(vehicle.delayMinutes) || 0,
    isMoving,
    accentColor: route?.color || '#06b6d4',
    stops: displayStops,
    trip,
  };
}
