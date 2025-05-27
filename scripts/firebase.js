// scripts/firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js';

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "",
  authDomain: "join-da-project.firebaseapp.com",
  databaseURL: "https://join-da-project-default-rtdb.firebaseio.com",
  projectId: "join-da-project",
  storageBucket: "join-da-project.appspot.com",
  messagingSenderId: "",
  appId: ""
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Task schreiben
export const writeTask = (id, task) => set(ref(db, 'tasks/' + id), task);

// Tasks lesen (mit Callback für Live-Updates)
export const readTasks = (callback) => {
  onValue(ref(db, 'tasks'), (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
