/**
 * Contact data service for Firebase operations.
 */
import {LocalStorageService} from '../scripts/utils/localStorageHelper.js';
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
export async function updateContact(contact, updated) {
  try {
    // Get current user from localStorage
    const currentUserString = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserString);
    
    if (!currentUser?.id) {
      throw new Error("No current user found");
    }

    const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${currentUser.id}/${contact.userId}.json`, {
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
        bindButton(bigContact, "#delete", () => deleteContactFromDatabase(contact.userId, contact.userFullName), );
        bindButton(bigContact, "#edit", () => openEditDialog(contact));

        if (window.innerWidth <= 768) {
          const contact = window.contactList.find(c => c.userID === updated.userId);
          if(contact){
            const { initializeFabMenu, initializeBackButton } = await import('../scripts/ui/fabContact.js');
            initializeFabMenu(contact);
            initializeBackButton(); 
          }
        }
      }

      closeEditWindow();
    } else {
      throw new Error(`Error updating contact: ${response.status}`);
    }
  } catch (error) {
    throw error;
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
    // Get current user from localStorage
    const currentUserString = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserString);
    
    if (!currentUser?.id) {
      throw new Error("No current user found");
    }

    const response = await fetch(`${FIREBASE_DATABASE_BASE_URL}/contacts/${currentUser.id}/${contactId}.json`, {
      method: 'DELETE'
    });

    if (response.ok) {
      if (window.contactList) {
        window.contactList = window.contactList.filter(c => c.userId !== contactId);
      }

      // TODO: Implement task cleanup if necessary
      await removeUserFromAllTasks(userName);

      handlePostDeleteView(window.contactList || []);
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
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
