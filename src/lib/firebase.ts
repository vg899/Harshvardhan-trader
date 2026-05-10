import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCS7Prl5lsGGxEzXGxCC-D_Aa9VmG99Cxs",
  authDomain: "harshvardhan-traders.firebaseapp.com",
  databaseURL: "https://harshvardhan-traders-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "harshvardhan-traders",
  storageBucket: "harshvardhan-traders.firebasestorage.app",
  messagingSenderId: "347303430713",
  appId: "1:347303430713:web:5855f13ddb78718ac6dbe8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
