// Firebase-Konfiguration und Initialisierung für die Web-App

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js';

const firebaseConfig = {
  apiKey: "",
  authDomain: "join-da-project.firebaseapp.com",
  databaseURL: "https://join-da-project-default-rtdb.firebaseio.com",
  projectId: "join-da-project",
  storageBucket: "join-da-project.appspot.com",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const writeTask = (id, task) => set(ref(db, 'tasks/' + id), task);

export const readTasks = (callback) => {
  onValue(ref(db, 'tasks'), (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
