// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browser } from '$app/environment';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCw9aTtPAs7_lK5rSy42INeNQBmQnfResw",
    authDomain: "megat-task.firebaseapp.com",
    projectId: "megat-task",
    storageBucket: "megat-task.firebasestorage.app",
    messagingSenderId: "144243878973",
    appId: "1:144243878973:web:e9d37c04d092e525820e54",
    measurementId: "G-F1TVPQCJH2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
export const analytics = browser ? getAnalytics(app) : null;
