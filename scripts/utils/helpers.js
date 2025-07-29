/**
 * @fileoverview General utility functions used throughout the application.
 */

import { requestData } from "../firebase.js";

/**
 * Converts a Firebase object structure into an array with ID included in each object.
 *
 * @param {Object} data - Firebase data object with ID as key and object as value.
 * @returns {Array<Object>} Array of objects with `id` and value properties.
 */
export function formatFirebaseDataToArray(data) {
  if (!data || typeof data !== "object") return [];

  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value
  }));
}

/**
 * Fetches all tasks from the Firebase database.
 *
 * @async
 * @returns {Promise<Array<Object>>} Array of task objects from the database.
 */
export async function loadAllTasksFromDatabase() {
  const response = await requestData("GET", "tasks");
  return formatFirebaseDataToArray(response.data);
}

/**
 * Extracts initials from a full name string.
 *
 * @param {string} name - The full name of a user.
 * @returns {string} The initials derived from the name (e.g., "Max Mustermann" → "MM").
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") return "??";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
}
