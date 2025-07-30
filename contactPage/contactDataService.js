/**
 * Contact data service for Firebase operations.
 */

import { getAllContactsFromDatabase } from './contactExternalService.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { closeEditWindow } from './contactModal.js';
import { handlePostDeleteView } from './contactUtils.js';

import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';
const BASE_URL = FIREBASE_DATABASE_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes

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
      console.log("Created current user as contact.");
    } catch (error) {
      console.error("Error creating current user as contact:", error);
    }
    return [currentUserContact, ...contacts];
  }
}

/**
 * Creates a new contact in Firebase.
 * 
 * @param {Object} contact - Contact data
 * @returns {Promise<Object>} Firebase response
 */
export async function createContact(contact) {
  try {
    console.log("Creating contact:", contact);
    const response = await fetch(`${BASE_URL}/contacts.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Firebase createContact response:", result);
    return result;
  } catch (error) {
    console.error("Error in createContact:", error);
    throw error;
  }
}

/**
 * Updates an existing contact in Firebase and refreshes the UI.
 * 
 * @param {Object} contact - Original contact object
 * @param {Object} updated - Updated data
 */
export async function updateContact(contact, updated) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contact.userId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    if (response.ok) {
      Object.assign(contact, updated);

      if (window.contactList) {
        const index = window.contactList.findIndex(c => c.userId === contact.userId);
        if (index !== -1) {
          window.contactList[index] = contact;
        }
      }

      clearContactListUI();
      renderAllContacts(window.contactList || []);

      const bigContact = document.getElementById("bigContact");
      if (bigContact && !bigContact.classList.contains("dp-none")) {
        const { generateBigContactTemplate } = await import('./contactExternalService.js');
        bigContact.innerHTML = generateBigContactTemplate(
          contact.userFullName,
          contact.userEmailAddress,
          contact.userPhoneNumber,
          contact.userInitials,
          contact.userColor
        );

        const { bindButton } = await import('./contactUtils.js');
        const { deleteContactFromDatabase } = await import('./contactDataService.js');
        const { openEditDialog } = await import('./contactEditor.js');
        bindButton(bigContact, "#delete", () => deleteContactFromDatabase(contact.userId, contact.userFullName));
        bindButton(bigContact, "#edit", () => openEditDialog(contact));
      }

      closeEditWindow();
      console.log("Contact updated successfully.");
    } else {
      console.error("Error updating contact:", response.status);
    }
  } catch (error) {
    console.error("Error updating contact:", error);
  }
}

/**
 * Deletes a contact from Firebase and updates the UI.
 * 
 * @param {string} userId - User ID of the contact
 * @param {string} userName - Name of the contact (for task cleanup if needed)
 */
export async function deleteContactFromDatabase(userId, userName) {
  const response = await fetch(`${BASE_URL}/contacts/${userId}.json`, {
    method: 'DELETE'
  });

  if (response.ok) {
    if (window.contactList) {
      window.contactList = window.contactList.filter(c => c.userId !== userId);
    }

    // TODO: Implement task cleanup if necessary
    // await removeUserFromAllTasks(userName);

    handlePostDeleteView(window.contactList || []);
  }
}

/**
 * Loads the current user from localStorage as a contact object.
 * 
 * @returns {Promise<Object|null>} Contact object or null if unavailable
 */
async function getCurrentUserAsContact() {
  try {
    const currentUserString = localStorage.getItem("currentUser");
    if (!currentUserString) return null;
    
    const userData = JSON.parse(currentUserString);
    
    return {
      userFullName: userData.userFullName || userData.name || "Current User",
      userEmailAddress: userData.userEmailAddress || userData.email || "",
      userPhoneNumber: userData.userPhoneNumber || userData.phone || "",
      userInitials: userData.userInitials || getInitialsFromName(userData.userFullName || userData.name || "AB"),
      firstCharacter: (userData.userFullName || userData.name || "A").charAt(0).toUpperCase(),
      userId: userData.userId || userData.id || "current-user",
      userColor: userData.userColor || "color-1"
    };
  } catch (error) {
    console.error("Error loading current user:", error);
    return null;
  }
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
