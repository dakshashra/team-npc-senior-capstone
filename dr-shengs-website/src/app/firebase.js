import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3vY3s8xhzunyGfWp85f9KinpQPER7--c",
    authDomain: "team-npc-capstone.firebaseapp.com",
    projectId: "team-npc-capstone",
    storageBucket: "team-npc-capstone.firebasestorage.app",
    messagingSenderId: "367383078302",
    appId: "1:367383078302:web:5300d677716f9721a1a28f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };