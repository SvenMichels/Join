/**
 * Generates a random CSS color class string in the format 'color-X',
 * where X is a number between 1 and 20.
 *
 * @returns {string} A string representing the randomly selected color class.
 */
export function generateRandomColorClass() {
  const randomColorNumber = Math.floor(Math.random() * 20) + 1;
  return `color-${randomColorNumber}`;
}
