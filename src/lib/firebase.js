import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración exacta
const firebaseConfig = {
  apiKey: "AIzaSyBLDeSeHBL2xicEyPHFskFWbtzuYxkA_Hg",
  authDomain: "homemartenic.firebaseapp.com",
  projectId: "homemartenic",
  storageBucket: "homemartenic.firebasestorage.app",
  messagingSenderId: "491359906424",
  appId: "1:491359906424:web:77993044b19392e6731b8d",
  measurementId: "G-N758YB17P9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
