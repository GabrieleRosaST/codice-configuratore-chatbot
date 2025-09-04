import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2XIoZoFoFyxDFoHr6HTZReD5ZW2tp6Xk",
  authDomain: "chatbot-vark-5d7d9.firebaseapp.com",
  projectId: "chatbot-vark-5d7d9",
  storageBucket: "chatbot-vark-5d7d9.firebasestorage.app",
  messagingSenderId: "661805673357",
  appId: "1:661805673357:web:5214010316c5d531e7ebc4",
  measurementId: "G-FYVWMZ19KK"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage(app);
