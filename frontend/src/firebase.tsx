// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration (Copy from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCT1fuQ2udkJl_utu17ESrrojXD6enKKxo",
    authDomain: "xplorefuture-fcd94.firebaseapp.com",
    projectId: "xplorefuture-fcd94",
    storageBucket: "xplorefuture-fcd94.firebasestorage.app",
    messagingSenderId: "217014708121",
    appId: "1:217014708121:web:ab4ed11cfcaa672f3cd508",
    measurementId: "G-BY00L51DVR"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
