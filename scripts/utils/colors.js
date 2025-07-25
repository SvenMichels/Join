export function generateRandomColorClass() {
  const randomColorNumber = Math.floor(Math.random() * 20) + 1;
  return `color-${randomColorNumber}`;
}