/**
 * Task Utilities
 * Hilfsfunktionen für Task-Verarbeitung
 */

/**
 * Konvertiert Eingabe zu Array
 * @param {any} input - Eingabewert (Array, Object, String oder anderes)
 * @returns {Array} Konvertiertes Array
 */
export function toArray(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return Object.values(input);
  if (typeof input === "string") {
    return input.split(",").map(part => part.trim());
  }
  return [];
}
