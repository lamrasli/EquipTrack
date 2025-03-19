// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBZFG-8nMUu4IwVzMvw1hGzQZDxqQ2NlTE",
    authDomain: "equiptrack-bb3af.firebaseapp.com",
    projectId: "equiptrack-bb3af",
    storageBucket: "equiptrack-bb3af.firebasestorage.app",
    messagingSenderId: "133406383802",
    appId: "1:133406383802:web:8a53023fed9cbd9f8f2c83",
    measurementId: "G-D6TNZJ4Z50"
  };

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, serverTimestamp, auth }; // Export serverTimestamp

