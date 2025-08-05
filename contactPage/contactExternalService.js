/**
 * Firebase and external contact services
 */

import { singleContact } from './contactTemplate.js';
import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';
import { LocalStorageService } from '../scripts/utils/localStorageHelper.js';

/**
 * Retrieves all contact entries from the Firebase database for the currently logged-in user.
 *
 * Contacts are stored under the user's unique ID in the database.
 * Each returned contact object includes its Firebase key as `userId`.
 *
 * @async
 * @function getAllContactsFromDatabase
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of contact objects.
 * Each object contains the original contact data plus a `userId` property (the Firebase key).
 * Returns an empty array if the user is not logged in or if an error occurs.
 */
export async function getAllContactsFromDatabase() {
  try {
    const currentUser = LocalStorageService.getItem("currentUser");

    if (!currentUser?.id) {
      return [];
    }
    const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${currentUser.id}.json`);
    const data = await response.json();
    return data ? Object.entries(data).map(([key, value]) => ({ ...value, userId: key })) : [];
  } catch (error) {
    console.error("Error loading contacts:", error);
    return [];
  }
}

/**
 * Generates initials from a full name.
 * 
 * @param {string} fullName - Full name of the user
 * @returns {string} Initials (e.g., "AB" from "Alice Baker")
 */
export function getInitials(fullName) {
  if (!fullName?.trim()) return "?";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1 ?
    names[0].charAt(0).toUpperCase() :
    names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}

/**
 * Creates the HTML template for the large contact view.
 * 
 * @param {string} name - Full name of the contact
 * @param {string} email - Email address of the contact
 * @param {string} phone - Phone number of the contact
 * @param {string} initials - Initials for the contact badge
 * @param {string} color - Color class for the badge
 * @returns {string} Rendered HTML string for the contact
 */
export function generateBigContactTemplate(name, email, phone, initials, color) {
  return singleContact(name, email, phone, initials, 'big-contact', color);
}
