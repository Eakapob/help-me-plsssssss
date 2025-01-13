// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCS7daBb1USZrXAw0wqSwZAaCIwcszqYU",
  authDomain: "pj-iii-d8ef1.firebaseapp.com",
  databaseURL: "https://pj-iii-d8ef1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pj-iii-d8ef1",
  storageBucket: "pj-iii-d8ef1.firebasestorage.app",
  messagingSenderId: "389056876730",
  appId: "1:389056876730:web:aca9c58160b15d5342b283",
  measurementId: "G-05Q433K4JE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;