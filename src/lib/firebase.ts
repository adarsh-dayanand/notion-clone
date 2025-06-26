
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// IMPORTANT: Replace the following with your actual Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5YSMTWAVVgOANa9bUsRfVHrQEm4Qsdp4",
  authDomain: "ad-notion-clone.firebaseapp.com",
  projectId: "ad-notion-clone",
  storageBucket: "ad-notion-clone.firebasestorage.app",
  messagingSenderId: "719366042363",
  appId: "1:719366042363:web:1aa885115528572b25f65e",
  measurementId: "G-9E0P8SRGT6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
