import { updateUser } from "../users/users.js";

export function getRandomColorClass() {
  const num = Math.floor(Math.random() * 20) + 1;
  return `color-${num}`;
}

export async function ensureUserHasColor(user) {
  if (!user.colorClass) {
    user.colorClass = getRandomColorClass();
    try {
      await updateUser(user.id, user);
    } catch (err) {
      console.error("Fehler beim Speichern der Farbe für User:", user.userName, err);
    }
  }
  return user;
}