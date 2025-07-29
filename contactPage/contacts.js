/**
 * Contacts.js - Main Contact Functions
 * Exportiert Hauptfunktionen für Kontakt-Management
 */

// Import functions from other modules
import { openEditDialog } from './contactEditor.js';
import { renderContact as renderContactFunction } from './contactRenderer.js';

/**
 * Öffnet das Bearbeitungsfenster für einen Kontakt
 * @param {Object} contact - Kontakt-Objekt zum Bearbeiten
 */
export function openEditWindow(contact) {
  // Wenn kein Kontakt übergeben wurde, versuche aktuellen User zu laden
  if (!contact) {
    // Für MyUser page - hole aktuellen User
    getCurrentUserForEdit();
    return;
  }
  
  openEditDialog(contact);
}

/**
 * Lädt aktuellen User für Bearbeitung
 */
async function getCurrentUserForEdit() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      const contact = {
        userFullName: userData.name || '',
        userEmailAddress: userData.email || '',
        userPhoneNumber: userData.phone || '',
        userColor: userData.color || '#FF7A00',
        userId: userData.id || 'current-user'
      };
      openEditDialog(contact);
    }
  } catch (error) {
    console.error('Error loading current user for edit:', error);
  }
}

/**
 * Rendert einen Kontakt
 * @param {Object} contact - Kontakt-Objekt
 */
export function renderContact(contact) {
  return renderContactFunction(contact);
}

/**
 * Bearbeitet einen Kontakt (für FAB Menu)
 * @param {string} contactId - ID des zu bearbeitenden Kontakts
 */
export function editContact(contactId) {
  // Diese Funktion wird vom FAB Menu aufgerufen
  const contact = findContactById(contactId);
  if (contact) {
    openEditDialog(contact);
  }
}

/**
 * Löscht einen Kontakt (für FAB Menu)
 * @param {string} contactId - ID des zu löschenden Kontakts
 */
export async function deleteContact(contactId) {
  // Diese Funktion wird vom FAB Menu aufgerufen
  if (window.deleteContactFromDatabase) {
    await window.deleteContactFromDatabase(contactId);
  }
}

/**
 * Findet einen Kontakt anhand der ID
 * @param {string} contactId - Kontakt ID
 * @returns {Object|null} Gefundener Kontakt oder null
 */
function findContactById(contactId) {
  // Versuche Kontakt aus globaler Liste zu finden
  if (window.contactList && Array.isArray(window.contactList)) {
    return window.contactList.find(contact => contact.userId === contactId);
  }
  return null;
}