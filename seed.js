// seed.js - puts demo data into Firestore.
// Run with:  node seed.js
// Safe to run again: it overwrites the same documents (no duplicates).

import { db } from "./src/firebase.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// ---------- STOPS ----------
// TODO: replace these PLACEHOLDER coordinates with real campus coordinates.
const stops = {
  stop_gate:    { name: "Main Gate",   lat: 20.0000, lng: 78.0000 },
  stop_library: { name: "Library",     lat: 20.0010, lng: 78.0010 },
  stop_hostel:  { name: "Hostel",      lat: 20.0020, lng: 78.0025 },
  stop_canteen: { name: "Canteen",     lat: 20.0015, lng: 78.0040 },
  stop_admin:   { name: "Admin Block", lat: 20.0005, lng: 78.0030 },
};

// ---------- ROUTES ----------
const routes = {
  route_a: {
    name: "Route A",
    color: "#e63946",
    stopIds: ["stop_gate", "stop_library", "stop_hostel", "stop_canteen"],
    active: true,
  },
  route_b: {
    name: "Route B",
    color: "#1d7bd8",
    stopIds: ["stop_canteen", "stop_admin", "stop_library", "stop_gate"],
    active: true,
  },
};

// ---------- VEHICLES ----------
// Each vehicle starts at the first stop of its route.
const vehicles = {
  bus_1: {
    name: "Shuttle 1",
    routeId: "route_a",
    status: "active",
    lat: stops.stop_gate.lat,
    lng: stops.stop_gate.lng,
    speed: 0,
    nextStopIndex: 1,
    delayed: false,
    delayMinutes: 0,
    crowding: "low",
  },
  bus_2: {
    name: "Shuttle 2",
    routeId: "route_b",
    status: "active",
    lat: stops.stop_canteen.lat,
    lng: stops.stop_canteen.lng,
    speed: 0,
    nextStopIndex: 1,
    delayed: false,
    delayMinutes: 0,
    crowding: "low",
  },
};

// ---------- WRITE TO FIRESTORE ----------
async function seed() {
  for (const [id, data] of Object.entries(stops)) {
    await setDoc(doc(db, "stops", id), data);
  }
  console.log("Stops done");

  for (const [id, data] of Object.entries(routes)) {
    await setDoc(doc(db, "routes", id), data);
  }
  console.log("Routes done");

  for (const [id, data] of Object.entries(vehicles)) {
    await setDoc(doc(db, "vehicles", id), { ...data, updatedAt: serverTimestamp() });
  }
  console.log("Vehicles done");

  console.log("Seeded!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
