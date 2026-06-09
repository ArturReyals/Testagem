
import { initializeApp } from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';
import { getStorage }     from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAK_iEkzEsLjKjLEo9MkIfvB1IJOa8zEZc",
  authDomain: "adopets-16d30.firebaseapp.com",
  projectId: "adopets-16d30",
  storageBucket: "adopets-16d30.firebasestorage.app",
  messagingSenderId: "325163240290",
  appId: "1:325163240290:web:1e93cb0d94f7211c7f3a3b",
  measurementId: "G-WEP1ZJHFEQ"
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);