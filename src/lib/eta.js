// ETA helper. Owner: Swaraj
// Stops must include their document id: { id: doc.id, ...doc.data() }

const AVG_SPEED_KMH = 20;

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// vehicle: vehicle doc data
// stop: the stop the student selected (needs .id)
// route: route doc data (needs .stopIds)
// allStops: array of all stop docs (each with .id)
// Returns { minutes, distanceKm } or null if it can't be calculated.
export function getEta(vehicle, stop, route, allStops) {
  if (!vehicle || !stop || !route?.stopIds?.length) return null;

  const byId = {};
  allStops.forEach((s) => (byId[s.id] = s));
  const stops = route.stopIds.map((id) => byId[id]).filter(Boolean);
  const n = stops.length;
  const target = stops.findIndex((s) => s.id === stop.id);
  if (n === 0 || target === -1) return null;

  // nextStopIndex = index (in route.stopIds) of the stop the vehicle is heading to
  let i = (vehicle.nextStopIndex ?? 0) % n;
  let km = distanceKm(vehicle.lat, vehicle.lng, stops[i].lat, stops[i].lng);

  // walk forward along the route (it loops) until we reach the target stop
  while (i !== target) {
    const next = (i + 1) % n;
    km += distanceKm(stops[i].lat, stops[i].lng, stops[next].lat, stops[next].lng);
    i = next;
  }

  const delay = vehicle.delayed ? vehicle.delayMinutes || 0 : 0;
  const minutes = Math.ceil((km / AVG_SPEED_KMH) * 60 + delay);
  return { minutes, distanceKm: km };
}

export function formatEta(eta) {
  if (!eta) return "No ETA";
  if (eta.minutes <= 1) return "Arriving now";
  return `${eta.minutes} min`;
}