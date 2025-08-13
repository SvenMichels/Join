/**
 * Contact data service for Firebase operations.
 */
import { LocalStorageService } from '../scripts/utils/localStorageHelper.js';
import { getAllContactsFromDatabase } from './contactExternalService.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { closeEditWindow } from './contactModal.js';
import { handlePostDeleteView } from './contactUtils.js';
import { removeUserFromAllTasks } from './contactsMain.js';

import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';

/**
 * Loads all contacts from Firebase.
 * Ensures the current user is listed first.
 * 
 * @returns {Promise<Array>} List of all contacts
 */
export async function loadAllContactsFromFirebaseDatabase() {
  try {
    const allContacts = await getAllContactsFromDatabase();

    let contactsArray = Array.isArray(allContacts) ? allContacts : [];

    contactsArray = await ensureCurrentUserAsFirstContact(contactsArray);
    if (contactsArray.length === 0) {
      const testContacts = await getAllContactsFromDatabase();
      contactsArray = Array.isArray(testContacts) ? testContacts : [];
      contactsArray = await ensureCurrentUserAsFirstContact(contactsArray);
    }

    window.contactList = contactsArray;

    clearContactListUI();
    renderAllContacts(contactsArray);
    return contactsArray;
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Ensures the current user is the first entry in the contact list.
 * 
 * @param {Array} contacts - Existing contact list
 * @returns {Array} Contact list with current user first
 */
async function ensureCurrentUserAsFirstContact(contacts) {
  const currentUserContact = await getCurrentUserAsContact();

  if (!currentUserContact) {
    return contacts;
  }

  const userIndex = contacts.findIndex(contact =>
    contact.userEmailAddress === currentUserContact.userEmailAddress ||
    contact.userId === currentUserContact.userId
  );

  if (userIndex !== -1) {
    const [user] = contacts.splice(userIndex, 1);
    return [user, ...contacts];
  } else {
    try {
      await createContact(currentUserContact);
    } catch (error) {
      // Silently handle error, contact creation is optional for display
    }
    return [currentUserContact, ...contacts];
  }
}

/**
 * Creates a new contact in Firebase for the current user.
 * 
 * @param {object} contact - Contact data
 * @returns {Promise<object>} Firebase response
 */
export async function createContact(contact) {
  try {
    // Get current user from localStorage
    const currentUser = LocalStorageService.getItem("currentUser");

    if (!currentUser?.id) {
      throw new Error("No current user found");
    }

    // Save contact under the specific user's path
    const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${currentUser.id}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Updates an existing contact in Firebase for the current user and refreshes the UI.
 * 
 * @param {Object} contact - Original contact object
 * @param {Object} updated - Updated data
 */
/**
 * Updates an existing contact in Firebase for the current user.
 * 
 * @param {Object} contact - Original contact object
 * @param {Object} updated - Updated data
 */
export async function updateContact(contact, updated) {
  try {
    const currentUser = getCurrentUserFromStorage();
    await updateContactInFirebase(currentUser.id, contact.userId, updated);
    updateLocalContactData(contact, updated);
    await refreshUI();
    await updateBigContactIfVisible(contact);
    closeEditWindow();
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

/**
 * Updates contact data in Firebase database.
 */
async function updateContactInFirebase(userId, contactId, contactData) {
  const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${userId}/${contactId}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    throw new Error(`Error updating contact: ${response.status}`);
  }
}

/**
 * Updates contact data in local memory.
 */
function updateLocalContactData(contact, updated) {
  Object.assign(contact, updated);

  if (window.contactList) {
    const index = window.contactList.findIndex(c => c.userId === contact.userId);
    if (index !== -1) {
      window.contactList[index] = contact;
    }
  }
}

/**
 * Refreshes the contact list UI.
 */
async function refreshUI() {
  clearContactListUI();
  renderAllContacts(window.contactList || []);
}

/**
 * Updates the big contact modal if currently visible.
 */
async function updateBigContactIfVisible(contact) {
  const bigContact = document.getElementById("bigContact");
  if (!bigContact || bigContact.classList.contains("dp-none")) return;

  await renderBigContactModal(bigContact, contact);
  bindBigContactButtons(bigContact, contact);
  
  if (window.innerWidth <= 768) {
    await initializeMobileFab(contact);
  }
}

/**
 * Renders the big contact modal content.
 */
async function renderBigContactModal(bigContact, contact) {
  const { generateBigContactTemplate } = await import('./contactExternalService.js');
  bigContact.innerHTML = generateBigContactTemplate(
    contact.userFullName,
    contact.userEmailAddress,
    contact.userPhoneNumber,
    contact.userInitials,
    contact.userColor
  );
}

/**
 * Binds action buttons in the big contact modal.
 */
async function bindBigContactButtons(bigContact, contact) {
  const { bindButton } = await import('./contactUtils.js');
  const { openEditDialog } = await import('./contactEditor.js');
  
  bindButton(bigContact, "#delete", () => deleteContactFromDatabase(contact.userId, contact.userFullName));
  bindButton(bigContact, "#edit", () => openEditDialog(contact));
}

/**
 * Initializes mobile FAB menu if needed.
 */
async function initializeMobileFab(contact) {
  const foundContact = window.contactList.find(c => c.userID === contact.userId);
  if (foundContact) {
    const { initializeFabMenu, initializeBackButton } = await import('../scripts/ui/fabContact.js');
    initializeFabMenu(foundContact);
    initializeBackButton();
  }
}

/**
 * Deletes a contact from Firebase and updates the UI for the current user.
 * 
 * @param {string} contactId - Contact ID to delete  
 * @param {string} userName - Name of the contact (for task cleanup if needed)
 */

export async function deleteContactFromDatabase(contactId, userName) {
  try {
    const currentUser = getCurrentUserFromStorage();
    const wasDeleted = await deleteContactFromFirebase(currentUser.id, contactId);

    if (!wasDeleted) return;

    updateContactList(contactId);
    await removeUserFromAllTasks(userName);
    handlePostDeleteView(window.contactList || []);
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

function getCurrentUserFromStorage() {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUser = JSON.parse(currentUserString);
  if (!currentUser?.id) {
    throw new Error("No current user found");
  }
  return currentUser;
}

async function deleteContactFromFirebase(userId, contactId) {
  const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${userId}/${contactId}.json`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.warn("Contact deletion failed", response.status);
    return false;
  }

  return true;
}

function updateContactList(contactId) {
  if (window.contactList) {
    window.contactList = window.contactList.filter(c => c.userId !== contactId);
  }
}

/**
 * Loads the current user from localStorage as a contact object.
 * 
 * @returns {Promise<Object|null>} Contact object or null if unavailable
 */
async function getCurrentUserAsContact() {
  try {
    const userData = getCurrentUserFromStorage();
    if (!userData) return null;

    return buildContactFromUserData(userData);
  } catch (error) {
    console.error("Error loading current user:", error);
    return null;
  }
}

function buildContactFromUserData(user) {
  const name = user.userFullName || user.name || "Current User";

  return {
    userFullName: name,
    userEmailAddress: user.userEmailAddress || user.email || "",
    userPhoneNumber: user.userPhoneNumber || user.phone || "",
    userInitials: user.userInitials || getInitialsFromName(name),
    firstCharacter: name.charAt(0).toUpperCase(),
    userId: user.userId || user.id || "current-user",
    userColor: user.userColor || "color-1"
  };
}


/**
 * Generates initials from a full name.
 * 
 * @param {string} fullName - Full name string
 * @returns {string} Initials (e.g. "JD" from "John Doe")
 */
function getInitialsFromName(fullName) {
  if (!fullName?.trim()) return "AB";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1
    ? names[0].charAt(0).toUpperCase()
    : names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}
