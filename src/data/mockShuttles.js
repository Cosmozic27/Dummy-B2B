/**
 * Mock data for Campus Shuttle Tracking System
 * This file serves as the single source of truth for the student dashboard during development.
 * Later, the backend team can replace this file with Firestore realtime listeners
 * or Node.js/Express API endpoints (/api/shuttles, /api/stops).
 */

export const CAMPUS_CENTER = [19.0760, 72.8777];

export const CAMPUS_STOPS = [
  {
    id: "STOP-01",
    name: "Hostel Complex Gate",
    shortCode: "HCG",
    latitude: 19.0788,
    longitude: 72.8745,
    type: "Terminal",
    shelter: true,
    estimatedWait: "3 min"
  },
  {
    id: "STOP-02",
    name: "Central Library & Innovation Hub",
    shortCode: "LIB",
    latitude: 19.0772,
    longitude: 72.8762,
    type: "Regular",
    shelter: true,
    estimatedWait: "5 min"
  },
  {
    id: "STOP-03",
    name: "Main Gate & Transit Center",
    shortCode: "MGT",
    latitude: 19.0755,
    longitude: 72.8785,
    type: "Hub",
    shelter: true,
    estimatedWait: "2 min"
  },
  {
    id: "STOP-04",
    name: "Engineering Block (Sector 3)",
    shortCode: "ENG",
    latitude: 19.0735,
    longitude: 72.8798,
    type: "Regular",
    shelter: true,
    estimatedWait: "6 min"
  },
  {
    id: "STOP-05",
    name: "Sports Arena & Food Court",
    shortCode: "SFC",
    latitude: 19.0748,
    longitude: 72.8732,
    type: "Regular",
    shelter: true,
    estimatedWait: "8 min"
  },
  {
    id: "STOP-06",
    name: "Research Park & Bio-Labs",
    shortCode: "RPK",
    latitude: 19.0792,
    longitude: 72.8804,
    type: "Regular",
    shelter: false,
    estimatedWait: "12 min"
  }
];

export const MOCK_SHUTTLES = [
  {
    id: "BUS-01",
    name: "Shuttle 01",
    numberPlate: "KA-01-SH-4421",
    status: "ON ROUTE", // 'ON ROUTE' | 'BOARDING' | 'ARRIVING SOON' | 'DELAYED'
    eta: "3 min",
    etaMinutes: 3,
    route: "Hostel → Main Gate → College",
    routeFullName: "Blue Line (North Campus - Main Transit Hub)",
    nextStop: "Main Gate",
    latitude: 19.0764,
    longitude: 72.8774,
    speed: "24 km/h",
    occupancy: "65%",
    occupancyLabel: "Moderate Seating",
    driverName: "Rajesh Kumar",
    heading: 145,
    accentColor: "#06b6d4", // Cyan
    polyline: [
      [19.0788, 72.8745], // Hostel Complex
      [19.0780, 72.8752],
      [19.0772, 72.8762], // Central Library
      [19.0764, 72.8774], // Current Shuttle Position
      [19.0755, 72.8785], // Main Gate
      [19.0745, 72.8792],
      [19.0735, 72.8798], // Engineering Block
      [19.0760, 72.8802],
      [19.0792, 72.8804]  // Research Park
    ],
    stops: [
      {
        id: "stop-h",
        name: "Hostel Complex Gate",
        status: "passed",
        time: "09:30 AM",
        eta: "Passed",
        distance: "0.8 km ago"
      },
      {
        id: "stop-l",
        name: "Central Library",
        status: "passed",
        time: "09:34 AM",
        eta: "Passed",
        distance: "0.3 km ago"
      },
      {
        id: "stop-m",
        name: "Main Gate",
        status: "current",
        time: "09:39 AM",
        eta: "3 min",
        distance: "400 m away",
        isTarget: true
      },
      {
        id: "stop-e",
        name: "Engineering Block",
        status: "upcoming",
        time: "09:44 AM",
        eta: "8 min",
        distance: "1.2 km away"
      },
      {
        id: "stop-r",
        name: "Research Park",
        status: "upcoming",
        time: "09:51 AM",
        eta: "15 min",
        distance: "2.1 km away"
      }
    ]
  },
  {
    id: "BUS-02",
    name: "Shuttle 02",
    numberPlate: "KA-01-SH-4422",
    status: "ON ROUTE",
    eta: "7 min",
    etaMinutes: 7,
    route: "Sports Arena → Library → Research Park",
    routeFullName: "Green Line (West Athletics - Academic Core)",
    nextStop: "Sports Arena",
    latitude: 19.0742,
    longitude: 72.8740,
    speed: "19 km/h",
    occupancy: "42%",
    occupancyLabel: "Plentiful Seats",
    driverName: "Anand Murthy",
    heading: 40,
    accentColor: "#10b981", // Emerald
    polyline: [
      [19.0748, 72.8732], // Sports Arena
      [19.0742, 72.8740], // Current Shuttle Position
      [19.0758, 72.8750],
      [19.0772, 72.8762], // Central Library
      [19.0782, 72.8780],
      [19.0792, 72.8804]  // Research Park
    ],
    stops: [
      {
        id: "stop-s2-1",
        name: "Sports Arena",
        status: "current",
        time: "09:43 AM",
        eta: "7 min",
        distance: "650 m away",
        isTarget: true
      },
      {
        id: "stop-s2-2",
        name: "Central Library",
        status: "upcoming",
        time: "09:49 AM",
        eta: "13 min",
        distance: "1.5 km away"
      },
      {
        id: "stop-s2-3",
        name: "Research Park",
        status: "upcoming",
        time: "09:56 AM",
        eta: "20 min",
        distance: "2.7 km away"
      }
    ]
  },
  {
    id: "BUS-03",
    name: "Shuttle 03",
    numberPlate: "KA-01-SH-4423",
    status: "BOARDING",
    eta: "1 min",
    etaMinutes: 1,
    route: "Engineering Block → Food Court → Hostel Complex",
    routeFullName: "Amber Express (Engineering South - Residential)",
    nextStop: "Engineering Block",
    latitude: 19.0735,
    longitude: 72.8798,
    speed: "0 km/h",
    occupancy: "88%",
    occupancyLabel: "Nearly Full",
    driverName: "Suresh Patil",
    heading: 280,
    accentColor: "#f59e0b", // Amber
    polyline: [
      [19.0735, 72.8798], // Engineering Block (Boarding)
      [19.0740, 72.8765],
      [19.0748, 72.8732], // Food Court
      [19.0768, 72.8735],
      [19.0788, 72.8745]  // Hostel Complex
    ],
    stops: [
      {
        id: "stop-s3-1",
        name: "Engineering Block",
        status: "current",
        time: "09:37 AM",
        eta: "1 min (Boarding)",
        distance: "At Platform 2",
        isTarget: true
      },
      {
        id: "stop-s3-2",
        name: "Food Court & Student Center",
        status: "upcoming",
        time: "09:42 AM",
        eta: "6 min",
        distance: "1.1 km away"
      },
      {
        id: "stop-s3-3",
        name: "Hostel Complex Gate",
        status: "upcoming",
        time: "09:48 AM",
        eta: "12 min",
        distance: "2.3 km away"
      }
    ]
  },
  {
    id: "BUS-04",
    name: "Shuttle 04",
    numberPlate: "KA-01-SH-4424",
    status: "ON ROUTE",
    eta: "11 min",
    etaMinutes: 11,
    route: "Metro Link → Main Gate → Research Park",
    routeFullName: "Purple Commuter (Outer Metro - Campus Circuit)",
    nextStop: "Main Gate",
    latitude: 19.0790,
    longitude: 72.8730,
    speed: "31 km/h",
    occupancy: "25%",
    occupancyLabel: "Lots of Room",
    driverName: "Vikram Sengupta",
    heading: 120,
    accentColor: "#a855f7", // Purple
    polyline: [
      [19.0795, 72.8710],
      [19.0790, 72.8730], // Current Position
      [19.0772, 72.8762],
      [19.0755, 72.8785], // Main Gate
      [19.0792, 72.8804]  // Research Park
    ],
    stops: [
      {
        id: "stop-s4-1",
        name: "Metro Station North Junction",
        status: "passed",
        time: "09:28 AM",
        eta: "Passed",
        distance: "1.4 km ago"
      },
      {
        id: "stop-s4-2",
        name: "Main Gate",
        status: "current",
        time: "09:47 AM",
        eta: "11 min",
        distance: "1.8 km away",
        isTarget: true
      },
      {
        id: "stop-s4-3",
        name: "Research Park",
        status: "upcoming",
        time: "09:54 AM",
        eta: "18 min",
        distance: "3.0 km away"
      }
    ]
  }
];

export const SYSTEM_METRICS = {
  activeShuttlesCount: 4,
  avgWaitTime: "4.5 min",
  networkHealth: "100% Operational",
  weather: "28°C Clear",
  lastUpdatedText: "Updated just now"
};
