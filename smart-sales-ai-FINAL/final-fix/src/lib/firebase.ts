import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Database-er jonno

const firebaseConfig = {
  apiKey: "AIzaSyAe4QL2d9mi9q0BvQsqO0aBdUSrBaXs1Jc",
  authDomain: "smart-sales-ai-81db9.firebaseapp.com",
  projectId: "smart-sales-ai-81db9",
  storageBucket: "smart-sales-ai-81db9.firebasestorage.app",
  messagingSenderId: "746554000963",
  appId: "1:746554000963:web:7fb332bdb4c3568b1fb6f6",
  measurementId: "G-5845YCN550"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // Database export korlam

googleProvider.setCustomParameters({ prompt: 'select_account' });