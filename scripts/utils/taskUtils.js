/**
 * @fileoverview Utility function for normalizing task input into an array.
 */

/**
 * Converts any input to an array format.
 *
 * @param {*} input - The input value (can be Array, Object, String, or other).
 * @returns {Array} A normalized array.
 */
export function toArray(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return Object.values(input);
  if (typeof input === "string") {
    return input.split(",").map(part => part.trim());
  }
  return [];
}
