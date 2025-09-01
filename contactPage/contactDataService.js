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
 * @typedef {Object} Contact
 * @property {string} [userId]         - Firebase key for the contact.
 * @property {string} userFullName     - Full name.
 * @property {string} userEmailAddress - Email address.
 * @property {string} userPhoneNumber  - Phone number.
 * @property {string} userInitials     - Initials (e.g., "AB").
 * @property {string} firstCharacter   - First uppercase character of the name.
 * @property {string} userColor        - Color class/code for the avatar.
 */

/**
 * Loads all contacts for the current user from Firebase and renders the list.
 * Ensures the current user appears as the first entry.
 *
 * @returns {Promise<Contact[]>} List of contacts.
 */
export async function loadAllContactsFromFirebaseDatabase() {
  try {

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
 * Moves the current user to the first position.
 * Does not mutate the input array and avoids duplicates.
 *
 * @param {Contact[]} contacts - Existing contact list.
 * @returns {Promise<Contact[]>} New list with the current user first.
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
 * Creates a new contact in Firebase for the current user.
 * Side effects: refreshes cache/UI by reloading contacts.
 *
 * @param {Contact} contact - Contact to store (without userId).
 * @returns {Promise<{name: string}>} Firebase POST result containing the new key in "name".
 * @throws {Error} If no current user is found or an HTTP error occurs.
 */
export async function createContact(contact) {
  const url = `${FIREBASE_DATABASE_BASE_URL}/users.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create contact failed ${res.status}: ${text}`);
  }

  const result = await res.json();
  window.contactList = null;
  await loadAllContactsFromFirebaseDatabase();
  return result;
}

/**
 * Updates an existing contact in Firebase.
 * Updates local data, re-renders the list, updates the detail view if visible,
 * and closes the edit modal.
 *
 * @param {Contact} contact - Original contact (with userId).
 * @param {Partial<Contact>} updated - Fields to update.
 * @returns {Promise<void>}
 * @throws {Error} On missing user or HTTP errors.
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
 * Updates contact data in Firebase.
 *
 * @param {string} userId - Current user ID.
 * @param {string} contactId - Contact ID (Firebase key).
 * @param {Contact} contactData - Complete contact data to store.
 * @returns {Promise<void>}
 * @throws {Error} On HTTP errors.
 */
async function updateContactInFirebase(userId, contactId, contactData) {
  const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/users/${contactId}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    throw new Error(`Error updating contact: ${response.status}`);
  }
}

/**
 * Updates contact data in the local cache (window.contactList).
 *
 * @param {Contact} contact - Target contact (merged with updated).
 * @param {Partial<Contact>} updated - Fields to apply.
 * @returns {void}
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
 * Re-renders the contact list UI.
 *
 * @returns {Promise<void>}
 */
export async function refreshUI() {
  const contactList = document.querySelector('.contact-list');
  if (contactList) {
    contactList.innerHTML = '';
  }
  clearContactListUI();
  await new Promise(resolve => setTimeout(resolve, 10));
  renderAllContacts(loadAllContactsFromFirebaseDatabase() || []);
}

/**
 * Updates the big contact view if it is currently visible.
 *
 * @param {Contact} contact - Contact to show.
 * @returns {Promise<void>}
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
 * Renders the content of the big contact view.
 *
 * @param {HTMLElement} bigContact - Container element.
 * @param {Contact} contact - Contact to render.
 * @returns {Promise<void>}
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
 * Binds action buttons (Delete/Edit) in the big contact view.
 *
 * @param {HTMLElement} bigContact - Container element.
 * @param {Contact} contact - Contact context for actions.
 * @returns {Promise<void>}
 */
async function bindBigContactButtons(bigContact, contact) {
  const { bindButton } = await import('./contactUtils.js');
  const { openEditDialog } = await import('./contactEditor.js');

  bindButton(bigContact, "#delete", () => deleteContactFromDatabase(contact.userId, contact.userFullName));
  bindButton(bigContact, "#edit", () => openEditDialog(contact));
}

/**
 * Initializes the mobile FAB menu if the contact is found.
 *
 * @param {Contact} contact - Contact context.
 * @returns {Promise<void>}
 */
async function initializeMobileFab(contact) {
  const { initializeFabMenu, initializeBackButton } = await import('../scripts/ui/fabContact.js');
  initializeFabMenu(contact);
  initializeBackButton();
}

/**
 * Deletes a contact for the current user in Firebase.
 * Updates the global list, removes the user from tasks,
 * updates the view, and clears/closes the edit modal.
 *
 * @param {string} contactId - Contact ID (Firebase key) to delete.
 * @param {string} userName - Contact display name (used for task cleanup).
 * @returns {Promise<void>}
 * @throws {Error} On deletion errors.
 */
export async function deleteContactFromDatabase(contactId, userName) {
  try {
    const wasDeleted = await deleteContactFromFirebase(contactId);
    if (!wasDeleted) return;
    updateContactList(contactId);
    await removeUserFromAllTasks(userName);
    handlePostDeleteView(window.contactList || []);
    clearAndCloseEditModal();
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  } finally {
    refreshUI();
  }
}

/**
 * Reads the current user from localStorage.
 *
 * @returns {{ id: string } & Record<string, any>} The current user.
 * @throws {Error} If no current user is found.
 */
function getCurrentUserFromStorage() {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUser = JSON.parse(currentUserString);
  if (!currentUser?.id) {
    throw new Error("No current user found");
  }
  return currentUser;
}

/**
 * Deletes a contact in Firebase.
 *
 * @param {string} userId - Current user ID.
 * @param {string} contactId - Contact ID (Firebase key).
 * @returns {Promise<boolean>} true on success, false otherwise.
 */
async function deleteContactFromFirebase(targetUserId) {
  const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/users/${targetUserId}.json`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.warn("Contact deletion failed", response.status);
    return false;
  }
  return true;
}

/**
 * Removes the contact from the global list (window.contactList).
 *
 * @param {string} contactId - Contact ID (Firebase key).
 * @returns {void}
 */
function updateContactList(contactId) {
  if (window.contactList) {
    window.contactList = window.contactList.filter(c => c.userId !== contactId);
  }
}

/**
 * Resets the edit modal (form reset, initials reset) and closes it.
 *
 * @returns {void}
 */
function clearAndCloseEditModal() {
  const form = document.getElementById("editContactForm");
  if (form) form.reset();

  const initials = document.getElementById("editInitials");
  if (initials) {
    initials.textContent = "";
    initials.className = "editInitials";
  }

  closeEditWindow();
}

/**
 * Loads the current user as a contact object.
 *
 * @returns {Promise<Contact|null>} Contact object or null.
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

/**
 * Builds a contact object from user data.
 *
 * @param {Record<string, any>} user - User data (e.g., from localStorage).
 * @returns {Contact} Contact object.
 */
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
 * Creates initials from a full name.
 *
 * @param {string} fullName - Full name.
 * @returns {string} Initials (e.g., "JD" for "John Doe").
 */
function getInitialsFromName(fullName) {
  if (!fullName?.trim()) return "AB";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1
    ? names[0].charAt(0).toUpperCase()
    : names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}