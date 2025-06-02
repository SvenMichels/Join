/**
 * Wandelt das von Firebase zurückgegebene Objekt in ein Array mit IDs um.
 * @param {Object} data - Das Firebase-Objekt, z. B. { "-id123": {...}, "-id456": {...} }
 * @returns {Array} - Ein Array von Objekten mit der ID als eigenes Feld
 */
import { requestData } from "../firebase.js";

export function formatFirebaseData(data) {
  if (!data || typeof data !== "object") return [];
  
  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value,
  }));
}

export async function loadTasks() {
  const { data } = await requestData("GET", "tasks");
  const tasksArray = formatFirebaseData(data);

  console.table(tasksArray);
}