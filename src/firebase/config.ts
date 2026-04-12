// ─────────────────────────────────────────────
//  FIREBASE CONFIG
//  Ganti nilai di bawah dengan config Firebase
//  project kamu dari Firebase Console.
//  https://console.firebase.google.com/
// ─────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD3X3CIEW7d1mDDswz2_77D6YSv_4kCVWA",
  authDomain: "undercover-iky.firebaseapp.com",
  databaseURL: "https://undercover-iky-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "undercover-iky",
  storageBucket: "undercover-iky.firebasestorage.app",
  messagingSenderId: "300955875447",
  appId: "1:300955875447:web:3c0315c46c7804742cee72",
  measurementId: "G-3FCN8N00LN"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
