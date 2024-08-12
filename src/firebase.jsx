// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDxOuBQCmFgjbcWleIBs3mfKVpeWKtyN4",
  authDomain: "project-ii-1d79f.firebaseapp.com",
  databaseURL: "https://project-ii-1d79f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-ii-1d79f",
  storageBucket: "project-ii-1d79f.appspot.com",
  messagingSenderId: "811494079289",
  appId: "1:811494079289:web:105a1eb0f03adb4f8c06e8",
  measurementId: "G-TNQ71RKBGS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;