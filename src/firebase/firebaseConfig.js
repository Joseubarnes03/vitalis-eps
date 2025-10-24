// src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBF_Rn-hvCegw63J2p2H1cYMXnjkX-TLSQ",
  authDomain: "vitalis-eps-88435.firebaseapp.com",
  projectId: "vitalis-eps-88435",
  storageBucket: "vitalis-eps-88435.appspot.com",
  messagingSenderId: "152583685014",
  appId: "1:152583685014:web:4b05ae7992fcc75def53b7",
  measurementId: "G-2HRJR3JHT4"
};

// Verifica si Firebase ya fue inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

