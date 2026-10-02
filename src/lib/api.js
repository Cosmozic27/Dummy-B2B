// src/lib/api.js  (owner: Backend partner)
// Helper functions the UI calls. Every function returns a promise.

import {
  collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { stopTrip } from "./simulator.js";

// ---------- Stops: { name, lat, lng } ----------
export const addStop = ({ name, lat, lng }) =>
  addDoc(collection(db, "stops"), { name, lat: Number(lat), lng: Number(lng) });

export const updateStop = (id, data) => {
  const clean = { ...data };
  if ("lat" in clean) clean.lat = Number(clean.lat);
  if ("lng" in clean) clean.lng = Number(clean.lng);
  return updateDoc(doc(db, "stops", id), clean);
};

// Also removes the stop from every route that uses it, so routes never point to a deleted stop
export async function deleteStop(id) {
  const used = await getDocs(query(collection(db, "routes"), where("stopIds", "array-contains", id)));
  await Promise.all(used.docs.map((r) => updateDoc(r.ref, { stopIds: arrayRemove(id) })));
  await deleteDoc(doc(db, "stops", id));
}

// ---------- Routes: { name, color, stopIds, active } ----------
export const addRoute = ({ name, color, stopIds = [], active = true }) =>
  addDoc(collection(db, "routes"), { name, color, stopIds, active });

export const updateRoute = (id, data) => updateDoc(doc(db, "routes", id), data);

export const deleteRoute = (id) => deleteDoc(doc(db, "routes", id));

// ---------- Vehicles ----------
// The vehicle starts at its route's first stop and heads for stop number 1 (same as seed.js)
export async function addVehicle({ name, routeId, status = "idle" }) {
  const routeSnap = await getDoc(doc(db, "routes", routeId));
  if (!routeSnap.exists()) throw new Error("Route not found: " + routeId);
  const firstStopId = (routeSnap.data().stopIds || [])[0];
  if (!firstStopId) throw new Error("This route has no stops yet. Add stops to the route first.");

  const stopSnap = await getDoc(doc(db, "stops", firstStopId));
  if (!stopSnap.exists()) throw new Error("First stop of the route not found: " + firstStopId);
  const { lat, lng } = stopSnap.data();

  return addDoc(collection(db, "vehicles"), {
    name, routeId, status,
    lat, lng, speed: 0, nextStopIndex: 1,
    delayed: false, delayMinutes: 0, crowding: "low",
    updatedAt: serverTimestamp(),
  });
}

export const updateVehicle = (id, data) =>
  updateDoc(doc(db, "vehicles", id), { ...data, updatedAt: serverTimestamp() });

export async function deleteVehicle(id) {
  // Stop its timer first, if it is running. Even if this fails, still delete the vehicle.
  try {
    await stopTrip(id);
  } catch (e) {
    console.error("deleteVehicle: could not stop trip:", e.message);
  }
  await deleteDoc(doc(db, "vehicles", id));
}

// ---------- Delay (stretch goal 1) ----------
// setDelay(id, 10) -> "Delayed +10 min".   setDelay(id, 0) -> clears the delay.
export function setDelay(vehicleId, minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  return updateDoc(doc(db, "vehicles", vehicleId), {
    delayed: m > 0,
    delayMinutes: m,
    updatedAt: serverTimestamp(),
  });
}

// ---------- Crowding (stretch goal 2) ----------
// level must be "low", "medium" or "full"
const LEVELS = ["low", "medium", "full"];
export function setCrowding(vehicleId, level) {
  if (!LEVELS.includes(level)) {
    return Promise.reject(new Error('Crowding must be "low", "medium" or "full"'));
  }
  return updateDoc(doc(db, "vehicles", vehicleId), {
    crowding: level,
    updatedAt: serverTimestamp(),
  });
}