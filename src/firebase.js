import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR8W4Pti7iMXjs1ktInihH0tErA_OXG-E",
  authDomain: "chatbot-vark-f5e03.firebaseapp.com",
  projectId: "chatbot-vark-f5e03",
  storageBucket: "chatbot-vark-f5e03.firebasestorage.app",
  messagingSenderId: "859459710556",
  appId: "1:859459710556:web:9673902eed4d064b8b0099",
  measurementId: "G-R7Z34CGE6D"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage(app);
