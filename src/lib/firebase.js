import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBHrIm3cxaWj5YeeepgebKneXHYQUkkyAI",
    authDomain: "gti-shell.firebaseapp.com",
    projectId: "gti-shell",
    storageBucket: "gti-shell.firebasestorage.app",
    messagingSenderId: "758638951183",
    appId: "1:758638951183:web:f371c914ead87450fedc7a"
};


const app =  initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };