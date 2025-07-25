/**
 * Utility Functions
 * Allgemeine Hilfsfunktionen für das Projekt
 */

import { requestData } from "../firebase.js";

/**
 * Konvertiert Firebase-Objekt zu Array mit IDs
 * @param {Object} data - Firebase-Daten-Objekt
 * @returns {Array} Array mit id-Feldern
 */
export function formatFirebaseDataToArray(data) {
  if (!data || typeof data !== "object") return [];
  
  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value
  }));
}

/**
 * Lädt alle Tasks aus der Datenbank
 * @returns {Promise<Array>} Array der Task-Daten
 */
export async function loadAllTasksFromDatabase() {
  const response = await requestData("GET", "tasks");
  return formatFirebaseDataToArray(response.data);
}

/**
 * Extrahiert Initialen aus Vollname
 * @param {string} name - Vollständiger Name
 * @returns {string} Initialen (z.B. "MM" für "Max Mustermann")
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
