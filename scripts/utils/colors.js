import { updateUserInformation } from "../users/users.js";

export function generateRandomColorClass() {
  const randomColorNumber = Math.floor(Math.random() * 20) + 1;
  return `color-${randomColorNumber}`;
}

export async function ensureUserHasAssignedColor(userDataObject) {
  if (!userDataObject.colorClass) {
    userDataObject.colorClass = generateRandomColorClass();
    try {
      await updateUserInformation(userDataObject.id, userDataObject);
    } catch (colorAssignmentError) {
      // Silently handle color assignment errors
    }
  }
  return userDataObject;
}
