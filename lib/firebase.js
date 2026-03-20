// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeuKi7lX7MyQUd7jUZ_HLASc12KuNgn5g",
  authDomain: "kavinayam-ec91a.firebaseapp.com",
  projectId: "kavinayam-ec91a",
  storageBucket: "kavinayam-ec91a.firebasestorage.app",
  messagingSenderId: "175625719154",
  appId: "1:175625719154:web:a3c3072235c67c068f61eb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
