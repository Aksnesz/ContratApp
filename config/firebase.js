// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9n6zeE3Ri9Gj34HkBNs18077nSM0wYOc",
  authDomain: "contratapp-b942e.firebaseapp.com",
  projectId: "contratapp-b942e",
  storageBucket: "contratapp-b942e.firebasestorage.app",
  messagingSenderId: "919438417961",
  appId: "1:919438417961:web:78ec94789c9e87ffb5bc38",
  measurementId: "G-XF1VBECS80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);