/**
 * Contacts.js - Main Contact Functions
 * Exports main functions for contact management.
 */

// Import functions from other modules
import { openEditDialog } from './contactEditor.js';
import { renderContact as renderContactFunction } from './contactRenderer.js';

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
 * Loads the current user from localStorage and opens edit dialog.
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
