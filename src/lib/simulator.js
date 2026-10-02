// src/lib/simulator.js  (owner: Backend partner)
// Moves a vehicle along its route's stops and writes to Firestore every 2 seconds.
// Runs in the browser tab where startTrip() was called (the operator's tab).

import { collection, getDocs, getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

const TICK_MS = 2000;     // update every 2 seconds
const STEP_METERS = 30;   // how far the shuttle moves each tick (demo speed)
const SPEED_KMH = 20;     // value stored in the "speed" field
const MAX_FAILS = 5;      // stop the trip after this many failed writes in a row

// vehicleId -> interval id (only trips running in THIS browser tab)
const timers = new Map();

function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// True if this tab is currently moving that vehicle (UI can use it to show Start/Stop)
export function isTripRunning(vehicleId) {
  return timers.has(vehicleId);
}

export async function startTrip(vehicleId) {
  if (timers.has(vehicleId)) return; // already running

  const vehicleRef = doc(db, "vehicles", vehicleId);
  const vSnap = await getDoc(vehicleRef);
  if (!vSnap.exists()) throw new Error("Vehicle not found: " + vehicleId);
  const vehicle = vSnap.data();
  if (!vehicle.routeId) throw new Error("This vehicle has no route assigned");

  const rSnap = await getDoc(doc(db, "routes", vehicle.routeId));
  if (!rSnap.exists()) throw new Error("Route not found: " + vehicle.routeId);
  const stopIds = rSnap.data().stopIds || [];

  // Read all stops once, then build the path in route order
  const stopsSnap = await getDocs(collection(db, "stops"));
  const stops = {};
  stopsSnap.forEach((d) => (stops[d.id] = d.data()));
  const path = stopIds.map((id) => stops[id]).filter(Boolean);
  if (path.length < 2) throw new Error("The route needs at least 2 stops");

  // Resume from the saved position, or start at the first stop
  let lat = vehicle.lat;
  let lng = vehicle.lng;
  let idx;
  if (typeof lat !== "number" || typeof lng !== "number") {
    lat = path[0].lat;
    lng = path[0].lng;
    idx = 1;
  } else {
    idx = (vehicle.nextStopIndex ?? 1) % path.length;
  }

  await updateDoc(vehicleRef, {
    status: "active", lat, lng, speed: SPEED_KMH, nextStopIndex: idx,
    updatedAt: serverTimestamp(),
  });

  if (timers.has(vehicleId)) return; // someone double-clicked while we were loading

  let busy = false;
  let fails = 0;
  const intervalId = setInterval(async () => {
    if (busy) return; // previous write still in progress
    busy = true;
    try {
      const target = path[idx];
      const dist = distanceM(lat, lng, target.lat, target.lng);
      if (dist <= STEP_METERS) {
        // Arrived: snap to the stop and aim for the next one (loops at the end)
        lat = target.lat;
        lng = target.lng;
        idx = (idx + 1) % path.length;
      } else {
        const f = STEP_METERS / dist;
        lat = lat + (target.lat - lat) * f;
        lng = lng + (target.lng - lng) * f;
      }
      if (!timers.has(vehicleId)) return; // trip was stopped meanwhile
      await updateDoc(vehicleRef, {
        lat, lng, speed: SPEED_KMH, nextStopIndex: idx, updatedAt: serverTimestamp(),
      });
      fails = 0;
    } catch (e) {
      fails += 1;
      console.error("Trip write failed (" + fails + "/" + MAX_FAILS + "):", e.message);
      if (fails >= MAX_FAILS) {
        clearInterval(intervalId);
        timers.delete(vehicleId);
      }
    } finally {
      busy = false;
    }
  }, TICK_MS);

  timers.set(vehicleId, intervalId);
}

export async function stopTrip(vehicleId) {
  const intervalId = timers.get(vehicleId);
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    timers.delete(vehicleId);
  }
  try {
    await updateDoc(doc(db, "vehicles", vehicleId), {
      status: "idle", speed: 0, updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("stopTrip: could not update vehicle:", e.message);
  }
}

// Handy for the demo: stop every trip running in this tab
export async function stopAllTrips() {
  await Promise.all([...timers.keys()].map((id) => stopTrip(id)));
}