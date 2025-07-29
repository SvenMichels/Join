/**
 * Firebase und externe Services
 */

import { singleContact } from './contactTemplate.js';
import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';

const BASE_URL = FIREBASE_DATABASE_BASE_URL.replace(/\/+$/, '');

/**
 * Alle Kontakte aus Firebase laden
 */
export async function getAllContactsFromDatabase() {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data ? Object.entries(data).map(([key, value]) => ({ ...value, userId: key })) : [];
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
    return [];
  }
}

/**
 * Initialen aus Namen erstellen
 */
export function getInitials(fullName) {
  if (!fullName?.trim()) return "?";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1 ? 
    names[0].charAt(0).toUpperCase() : 
    names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}

/**
 * Template für Kontaktansicht erstellen
 */
export function generateBigContactTemplate(name, email, phone, initials, color) {
  return singleContact(name, email, phone, initials, 'big-contact', color);
}
