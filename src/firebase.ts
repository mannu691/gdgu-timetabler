import { initializeApp } from 'firebase/app'
const firebaseConfig = {

  apiKey: "AIzaSyD1n4-d-0ABwXGG2bcJY1oi3W5MD7dhJ78",

  authDomain: "gdgu-timetabler.firebaseapp.com",

  projectId: "gdgu-timetabler",

  storageBucket: "gdgu-timetabler.firebasestorage.app",

  messagingSenderId: "968863369841",

  appId: "1:968863369841:web:97fed237734832403f69d0",

  measurementId: "G-YGXGM8GP6Y"

};

export const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
