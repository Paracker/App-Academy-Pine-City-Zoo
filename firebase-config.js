// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDFoe8WG-6i9oXMFIxAE9cbhb2BO48pUys",
  authDomain: "grade-r-learning.firebaseapp.com",
  projectId: "grade-r-learning",
  storageBucket: "grade-r-learning.firebasestorage.app",
  messagingSenderId: "469418568683",
  appId: "1:469418568683:web:e611079c688949a5b887ae",
  measurementId: "G-CEF2WW17HL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support offline persistence');
    }
  });

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});
