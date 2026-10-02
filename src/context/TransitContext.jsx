import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  subscribeTransitCollections,
  updateVehicle,
} from '../services/firestoreTransit.js';
import {
  advanceVehicleAlongRoute,
  createTripStartPatch,
  SIMULATION_TICK_MS,
} from '../services/transitSimulation.js';
import { TransitContext } from './transitContext.js';

const REQUIRED_COLLECTIONS = ['vehicles', 'routes', 'stops'];

function withoutId(items, id) {
  const next = new Set(items);
  next.delete(id);
  return next;
}

export function TransitProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loadedCollections, setLoadedCollections] = useState(() => new Set());
  const [simulationOwners, setSimulationOwners] = useState(() => new Set());
  const [error, setError] = useState('');
  const vehiclesRef = useRef([]);
  const routesRef = useRef([]);
  const stopsRef = useRef([]);
  const inFlightRef = useRef(new Set());

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);
  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);
  useEffect(() => {
    stopsRef.current = stops;
  }, [stops]);

  const markLoaded = useCallback((collectionName) => {
    setLoadedCollections((current) => {
      if (current.has(collectionName)) return current;
      const next = new Set(current);
      next.add(collectionName);
      return next;
    });
  }, []);

  useEffect(() => subscribeTransitCollections({
    onVehicles: (items) => {
      setVehicles(items);
      markLoaded('vehicles');
      setError('');
    },
    onRoutes: (items) => {
      setRoutes(items);
      markLoaded('routes');
      setError('');
    },
    onStops: (items) => {
      setStops(items);
      markLoaded('stops');
      setError('');
    },
    onError: (listenerError) => {
      console.error('Firestore listener error:', listenerError);
      setError('Live campus data could not be loaded. Check Firestore access and try again.');
    },
  }), [markLoaded]);

  useEffect(() => {
    if (simulationOwners.size === 0) return undefined;

    const timer = window.setInterval(() => {
      for (const vehicleId of simulationOwners) {
        if (inFlightRef.current.has(vehicleId)) continue;

        const vehicle = vehiclesRef.current.find((item) => item.id === vehicleId);
        if (!vehicle || Number(vehicle.speed) <= 0) {
          setSimulationOwners((current) => withoutId(current, vehicleId));
          continue;
        }

        const route = routesRef.current.find((item) => item.id === vehicle.routeId);
        const movement = advanceVehicleAlongRoute(vehicle, route, stopsRef.current);
        if (!movement) {
          setError(`Movement stopped for ${vehicle.name || vehicle.id}: its route or coordinates are unavailable.`);
          setSimulationOwners((current) => withoutId(current, vehicleId));
          continue;
        }

        inFlightRef.current.add(vehicleId);
        updateVehicle(vehicleId, movement)
          .catch((writeError) => {
            console.error('Vehicle simulation write failed:', writeError);
            setError('Vehicle movement could not be synced to Firestore. The local simulation has stopped.');
            setSimulationOwners((current) => withoutId(current, vehicleId));
          })
          .finally(() => inFlightRef.current.delete(vehicleId));
      }
    }, SIMULATION_TICK_MS);

    return () => window.clearInterval(timer);
  }, [simulationOwners]);

  const startTrip = useCallback(async (vehicleId, routeId, speedKmh) => {
    const vehicle = vehiclesRef.current.find((item) => item.id === vehicleId);
    const route = routesRef.current.find((item) => item.id === routeId);
    if (!vehicle) throw new Error('The selected vehicle is no longer available.');
    if (!route || route.active === false) throw new Error('Choose an active route.');
    if (Number(vehicle.speed) > 0) throw new Error('This vehicle is already moving.');

    const patch = createTripStartPatch(route, stopsRef.current, speedKmh);
    await updateVehicle(vehicleId, patch);
    vehiclesRef.current = vehiclesRef.current.map((item) => item.id === vehicleId ? { ...item, ...patch } : item);
    setSimulationOwners((current) => new Set(current).add(vehicleId));
    setError('');
  }, []);

  const stopTrip = useCallback(async (vehicleId) => {
    await updateVehicle(vehicleId, { speed: 0 });
    vehiclesRef.current = vehiclesRef.current.map((item) => item.id === vehicleId ? { ...item, speed: 0 } : item);
    setSimulationOwners((current) => withoutId(current, vehicleId));
    setError('');
  }, []);

  const setVehicleDelay = useCallback(async (vehicleId, minutes) => {
    const delayMinutes = Number(minutes);
    if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
      throw new Error('Delay must be a positive number of minutes.');
    }
    await updateVehicle(vehicleId, { delayed: true, delayMinutes });
    vehiclesRef.current = vehiclesRef.current.map((item) => item.id === vehicleId
      ? { ...item, delayed: true, delayMinutes }
      : item);
    setError('');
  }, []);

  const clearVehicleDelay = useCallback(async (vehicleId) => {
    await updateVehicle(vehicleId, { delayed: false, delayMinutes: 0 });
    vehiclesRef.current = vehiclesRef.current.map((item) => item.id === vehicleId
      ? { ...item, delayed: false, delayMinutes: 0 }
      : item);
    setError('');
  }, []);

  const value = useMemo(() => ({
    vehicles,
    routes,
    stops,
    loading: REQUIRED_COLLECTIONS.some((name) => !loadedCollections.has(name)),
    error,
    setError,
    startTrip,
    stopTrip,
    setVehicleDelay,
    clearVehicleDelay,
    isSimulationOwner: (vehicleId) => simulationOwners.has(vehicleId),
  }), [vehicles, routes, stops, loadedCollections, error, startTrip, stopTrip, setVehicleDelay, clearVehicleDelay, simulationOwners]);

  return <TransitContext.Provider value={value}>{children}</TransitContext.Provider>;
}
