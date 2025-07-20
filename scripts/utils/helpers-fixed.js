// Convert Firebase object to array with IDs
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

export function getInitials(name) {
  if (typeof name !== "string") return "";

  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts.at(-1)?.[0] || "")).toUpperCase();
}
