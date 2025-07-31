/**
 * Firebase and external contact services
 */

import { singleContact } from './contactTemplate.js';
import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';

const BASE_URL = FIREBASE_DATABASE_BASE_URL.replace(/\/+$/, '');

/**
 * Fetches all contacts from the Firebase database for the current user.
 * 
 * @returns {Promise<Array>} Array of contact objects with attached userId
 */
export async function getAllContactsFromDatabase() {
  try {
    // Get current user from localStorage
    const currentUserString = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserString);
    
    if (!currentUser?.id) {
      console.warn("No current user found");
      return [];
    }

    // Fetch only contacts for the current user
    const response = await fetch(`${BASE_URL}/contacts/${currentUser.id}.json`);
    if (!response.ok) {
      if (response.status === 404) {
        // No contacts exist for this user yet
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
