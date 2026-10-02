import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const TRANSIT_COLLECTIONS = Object.freeze({
  vehicles: 'vehicles',
  routes: 'routes',
  stops: 'stops',
});

const EXISTING_VEHICLE_FIELDS = new Set([
  'lat',
  'lng',
  'routeId',
  'nextStopIndex',
  'status',
  'speed',
  'delayed',
  'delayMinutes',
]);

function withDocumentId(snapshot) {
  return snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  }));
}

export function subscribeTransitCollections({ onVehicles, onRoutes, onStops, onError }) {
  const subscriptions = [
    [TRANSIT_COLLECTIONS.vehicles, onVehicles],
    [TRANSIT_COLLECTIONS.routes, onRoutes],
    [TRANSIT_COLLECTIONS.stops, onStops],
  ];

  const unsubscribers = subscriptions.map(([collectionName, onData]) =>
    onSnapshot(
      collection(db, collectionName),
      (snapshot) => onData(withDocumentId(snapshot)),
      (error) => onError?.(error),
    ),
  );

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export async function updateVehicle(vehicleId, changes) {
  if (!vehicleId) throw new Error('Choose a vehicle first.');

  const entries = Object.entries(changes);
  const unsupported = entries.map(([field]) => field).filter((field) => !EXISTING_VEHICLE_FIELDS.has(field));
  if (unsupported.length > 0) {
    throw new Error(`Refusing to write fields outside the existing vehicle schema: ${unsupported.join(', ')}`);
  }

  await updateDoc(doc(db, TRANSIT_COLLECTIONS.vehicles, vehicleId), {
    ...Object.fromEntries(entries),
    updatedAt: serverTimestamp(),
  });
}

export async function createRoute({ name, stopIds, color }) {
  const cleanName = String(name ?? '').trim();
  const cleanStopIds = [...new Set((stopIds ?? []).filter(Boolean))];
  if (!cleanName) throw new Error('Enter a route name.');
  if (cleanStopIds.length < 2) throw new Error('Choose at least two ordered stops.');

  return addDoc(collection(db, TRANSIT_COLLECTIONS.routes), {
    name: cleanName,
    stopIds: cleanStopIds,
    color: color || '#06b6d4',
    active: true,
  });
}
