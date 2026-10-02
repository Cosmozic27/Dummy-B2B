# Progress Report — Smart Campus Mobility

**Updated:** 2 Oct 2026
**Repository:** [Cosmozic27/Dummy-B2B](https://github.com/Cosmozic27/Dummy-B2B)
**Branch:** `feature/firestore-transit-dashboard`

## Delivered

- Ported the existing student dashboard, Shuttle Details, and operator console to the team's Firebase configuration and live Firestore data.
- Added a shared realtime provider for vehicles, routes, and stops; document IDs are preserved for route stop references.
- Used the supplied `src/lib/eta.js` helper for student stop ETAs.
- Added operator start/stop simulation and delay controls using only existing vehicle fields.
- Kept student map, shuttle list, stop arrivals, Shuttle Details, fleet table, and operator console on the same Firestore vehicle state.
- Removed the route-creation UI/write path; this demo uses the existing routes only.
- Corrected active-vehicle totals so `IDLE` vehicles are not counted as active.

## Schema and data safeguards

**No Firestore schema changes were made.** Existing collections are `vehicles` (3 documents), `routes` (3), and `stops` (13). The `trips` collection has 0 documents; no trip collection or documents were created. Existing vehicle fields used by the demo include `routeId`, `lat`, `lng`, `nextStopIndex`, `speed`, `status`, `delayed`, `delayMinutes`, and the existing `updatedAt` timestamp.

Acceptance testing used the available first vehicle, `bus_1` / “Shuttle 1” (the live seed does not contain a `BUS-01`-named record). After testing, movement was stopped and the vehicle's original fields and timestamp were restored. A post-test audit confirmed the original 11-field document shape and collection counts.

## Acceptance test performed

1. Open the app and enter the Operator demo.
2. Start `bus_1` on its existing Route A; Firestore position changed across snapshots.
3. Switch to Student view without reloading; the live vehicle appeared on the map.
4. Select Railway Mahim; its route-based ETA appeared (2 minutes during the test).
5. Mark the vehicle delayed by 5 minutes; Student view updated to `DELAYED` and 7 minutes.
6. Open Shuttle Details; it showed the same delayed state, coordinates, route progress, and ETA.
7. Stop simulation, clear the delay, and restore the original `bus_1` record.

The browser console showed no output/errors during the flow.

## Verification

- `npm run build`: passed (Vite reports the existing large-chunk advisory).
- `npm run lint`: passed with 0 warnings and 0 errors.
- `git diff --check`: passed.
- Firestore post-test audit: 3 vehicles, 3 routes, 13 stops, 0 trip documents; no fields added.

## Demo instructions

1. Open the app and select the Operator demo.
2. In **Trip Simulation**, keep `bus_1 · Shuttle 1` and its existing Route A, then select **Start Trip**.
3. Switch to **Student View** and select **Railway Mahim (Mahim Junction)** in Arrivals at a Stop (or select it on the map).
4. Return to Operator and select **Mark delayed** with 5 minutes.
5. Switch back to Student to see the delayed status and updated ETA; use **Full Details** to inspect the same live vehicle state.
6. Use **Stop Simulation** and **Clear delay** to finish the demo.

## Skipped

No route creation, new authentication, new backend/API, new Firestore collections/fields, 3D landing page, or visual-effects work was added. The trip is simulated through the existing vehicle document because no trip documents are present in Firestore.
