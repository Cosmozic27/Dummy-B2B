import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIg_4CGnRu9zy0qy7sBal6qyOE21F7Eh0",
  authDomain: "smart-campus-mobility-shuttle.firebaseapp.com",
  projectId: "smart-campus-mobility-shuttle",
  storageBucket: "smart-campus-mobility-shuttle.firebasestorage.app",
  messagingSenderId: "267952706496",
  appId: "1:267952706496:web:0828aa6fb3c30068deee25",
  measurementId: "G-CYSZJCP3T9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);