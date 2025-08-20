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
    // Clear any existing cached data
    window.contactList = null;

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
 * Moves the current user contact to the first position of the list.
 * If the user is not present, a fresh current-user contact is prepended.
 * Never mutates the input array. No duplicates.
 *
 * @async
 * @param {Contact[]} contacts - Existing contact list.
 * @returns {Promise<Contact[]>} A new array with the current user first.
 */
export async function ensureCurrentUserAsFirstContact(contacts) {
  const currentUser = await getCurrentUserAsContact();
  if (!currentUser) return contacts;

  const ensureCurrentUser = c =>
    c.userEmailAddress === currentUser.userEmailAddress || c.userId === currentUser.userId;

  const existing = contacts.find(ensureCurrentUser);
  const contactList = contacts.filter(c => !ensureCurrentUser(c));

  return existing ? [existing, ...contactList] : [currentUser, ...contactList];
}

/**
 * Creates a contact for the current user in Firebase.
 * Refreshes local cache afterwards.
 * @param {Object} contact
 * @returns {Promise<Object>} Firebase POST result
 * @throws {Error} If no current user or HTTP error
 */
export async function createContact(contact) {
  const user = LocalStorageService.getItem("currentUser");
  if (!user?.id) throw new Error("No current user found");
  const res = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${user.id}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const result = await res.json();
  window.contactList = null;
  await loadAllContactsFromFirebaseDatabase();
  return result;
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
  const contactList = document.querySelector('.contact-list');
  if (contactList) {
    contactList.innerHTML = '';
  }

  clearContactListUI();

  await new Promise(resolve => setTimeout(resolve, 10));

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
