import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAwCboMi4_rjL_pDkj0_VAjVw8DLGB7ve8",
  authDomain: "training-arc-e9eab.firebaseapp.com",
  projectId: "training-arc-e9eab",
  storageBucket: "training-arc-e9eab.firebasestorage.app",
  messagingSenderId: "1091648749258",
  appId: "1:1091648749258:web:98625508d95c4d9982fe33",
  measurementId: "G-TP6Y025CTH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// Initialize Firebase Authentication
export { db, auth };