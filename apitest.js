import { db } from "./src/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import * as api from "./src/lib/api.js";

console.log("exports:", Object.keys(api));
const read = async () => (await getDoc(doc(db, "vehicles", "bus_1"))).data();

await api.setDelay("bus_1", 5);
let v = await read();
console.log("delay:", v.delayed, v.delayMinutes); // true 5

await api.setCrowding("bus_1", "full");
v = await read();
console.log("crowding:", v.crowding); // full

await api.setDelay("bus_1", 0);
await api.setCrowding("bus_1", "low");
v = await read();
console.log("reset:", v.delayed, v.delayMinutes, v.crowding, v.routeId); // false 0 low route_a
process.exit(0);