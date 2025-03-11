// firebase.js
const firebaseConfig = {
    apiKey: "AIzaSyAIHFiw9p3nMeJ0Agqnmn8rozBGiJVpeGg",
    authDomain: "hbnotes-48e73.firebaseapp.com",
    databaseURL: "https://hbnotes-48e73-default-rtdb.firebaseio.com",
    projectId: "hbnotes-48e73",
    storageBucket: "hbnotes-48e73.firebasestorage.app",
    messagingSenderId: "683683128751",
    appId: "1:683683128751:web:93d1966f89455016bdfb5a",
    measurementId: "G-HYFX55PE8F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Make db available globally
window.db = db;