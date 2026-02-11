import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCu9fbZq-IL8OvrKfk5ux7OhAepM0yj3XY",
  authDomain: "kingkong-e8eab.firebaseapp.com",
  projectId: "kingkong-e8eab",
  storageBucket: "kingkong-e8eab.firebasestorage.app",
  messagingSenderId: "605469166847",
  appId: "1:605469166847:web:093e62b1631989f1ebd0ca"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
