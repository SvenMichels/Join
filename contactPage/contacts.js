/**
 * Contacts.js - Main Contact Functions
 * Exports main functions for contact management.
 */

// Import functions from other modules
import { openEditDialog } from './contactEditor.js';
import { renderContact as renderContactFunction } from './contactRenderer.js';
import { LocalStorageService } from '../scripts/utils/localStorageHelper.js';

/**
 * Opens the contact editing dialog.
 * 
 * @param {Object} contact - Contact object to edit. If not provided, loads current user.
 */
export function openEditWindow(contact) {
  // If no contact provided, try to load current user
  if (!contact) {
    getCurrentUserForEdit(); // For "MyUser" page
    return;
  }
  
  openEditDialog(contact);
}

/**
 * Loads the current user's data from localStorage and opens the edit dialog.
 *
 * This function tries to get the current user's information from localStorage using the key 'userData'.
 * If user data is found, it prepares the contact object and opens the edit dialog for that user.
 * If not found, it uses fallback/default values.
 *
 * @async
 * @function
 * @returns {Promise<void>} This function does not return anything.
 */
async function getCurrentUserForEdit() {
    const userData = LocalStorageService.getItem('userData');
    if(userData){
      console.debug("[Contacts.js] No user data found in localStorage. Using fallback values");
    }

    const contact = getContactData(userData);
    openEditDialog(contact);
}

/**
 * Creates a contact object from user data.
 *
 * This function takes the user data (which may be undefined or missing some fields)
 * and returns a contact object with default values if needed.
 *
 * @function
 * @param {Object} [userData] - The user data object from localStorage. Can be undefined.
 * @param {string} [userData.name] - The user's full name.
 * @param {string} [userData.email] - The user's email address.
 * @param {string} [userData.phone] - The user's phone number.
 * @param {string} [userData.color] - The user's color (for avatar or UI).
 * @param {string} [userData.id] - The user's unique ID.
 * @returns {object} A contact object with properties: userFullName, userEmailAddress, userPhoneNumber, userColor, userId.
 * @example
 * const contact = getContactData({ name: 'Alice', email: 'alice@example.com' });
 * // contact.userFullName === 'Alice'
 */
function getContactData(userData){
  return {
      userFullName: userData?.name || '',
      userEmailAddress: userData?.email || '',
      userPhoneNumber: userData?.phone || '',
      userColor: userData?.color || '#FF7A00',
      userId: userData?.id || 'current-user'
    }
}

/**
 * Renders a contact card.
 * 
 * @param {Object} contact - Contact object to render.
 * @returns {HTMLElement} Rendered contact element.
 */
export function renderContact(contact) {
  return renderContactFunction(contact);
}

/**
 * Edits a contact from the FAB menu.
 * 
 * @param {string} contactId - ID of the contact to edit.
 */
export function editContact(contactId) {
  const contact = findContactById(contactId);
  if (contact) {
    openEditDialog(contact);
  }
}

/**
 * Deletes a contact from the FAB menu.
 * 
 * @param {string} contactId - ID of the contact to delete.
 */
export async function deleteContact(contactId) {
  if (window.deleteContactFromDatabase) {
    await window.deleteContactFromDatabase(contactId);
  }
}

/**
 * Finds a contact in the global list by ID.
 * 
 * @param {string} contactId - ID of the contact to find.
 * @returns {Object|null} Contact object or null if not found.
 */
function findContactById(contactId) {
  if (window.contactList && Array.isArray(window.contactList)) {
    return window.contactList.find(contact => contact.userId === contactId);
  }
  return null;
}
