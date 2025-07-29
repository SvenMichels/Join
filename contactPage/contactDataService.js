/**
 * Kontakt-Datenservice für Firebase-Operationen
 */

import { getAllContactsFromDatabase } from './contactExternalService.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { closeEditWindow } from './contactModal.js';
import { handlePostDeleteView } from './contactUtils.js';

// Firebase Base URL Import
import { FIREBASE_DATABASE_BASE_URL } from '../scripts/firebase.js';
const BASE_URL = FIREBASE_DATABASE_BASE_URL.replace(/\/+$/, ''); // Entferne alle trailing slashes

/**
 * Lädt alle Kontakte aus Firebase
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
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

/**
 * Stellt sicher, dass der aktuelle Benutzer der erste Kontakt ist
 * @param {Array} contacts - Bestehende Kontakte
 * @returns {Array} Kontakte mit aktuellem Benutzer als ersten
 */
async function ensureCurrentUserAsFirstContact(contacts) {
  const currentUserContact = await getCurrentUserAsContact();
  
  if (!currentUserContact) {
    return contacts;
  }

  // Prüfe ob aktueller Benutzer bereits in der Liste ist
  const userIndex = contacts.findIndex(contact =>
    contact.userEmailAddress === currentUserContact.userEmailAddress ||
    contact.userId === currentUserContact.userId
  );

  if (userIndex !== -1) {
    // Benutzer existiert bereits, verschiebe ihn an den Anfang
    const [user] = contacts.splice(userIndex, 1);
    return [user, ...contacts];
  } else {
    // Benutzer existiert nicht, füge ihn am Anfang hinzu
    try {
      await createContact(currentUserContact);
      console.log("Aktueller Benutzer als Kontakt erstellt");
    } catch (error) {
      console.error("Fehler beim Erstellen des aktuellen Benutzers als Kontakt:", error);
    }
    return [currentUserContact, ...contacts];
  }
}

/**
 * Erstellt neuen Kontakt in Firebase
 * @param {Object} contact - Kontaktdaten
 * @returns {Promise} Firebase Response
 */
export async function createContact(contact) {
  try {
    console.log("Erstelle Kontakt:", contact);
    const response = await fetch(`${BASE_URL}/contacts.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Firebase createContact Antwort:", result);
    return result;
  } catch (error) {
    console.error("Fehler in createContact:", error);
    throw error;
  }
}

/**
 * Aktualisiert existierenden Kontakt
 * @param {Object} contact - Originalkontakt
 * @param {Object} updated - Aktualisierte Daten
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

      // Update globale contactList
      if (window.contactList) {
        const index = window.contactList.findIndex(c => c.userId === contact.userId);
        if (index !== -1) {
          window.contactList[index] = contact;
        }
      }

      // Kontaktliste neu rendern
      clearContactListUI();
      renderAllContacts(window.contactList || []);

      // BigCard mit aktualisierten Daten neu rendern, falls sie geöffnet ist
      const bigContact = document.getElementById("bigContact");
      if (bigContact && !bigContact.classList.contains("dp-none")) {
        // BigCard ist sichtbar, aktualisiere sie mit den neuen Daten
        const { generateBigContactTemplate } = await import('./contactExternalService.js');
        bigContact.innerHTML = generateBigContactTemplate(
          contact.userFullName,
          contact.userEmailAddress,
          contact.userPhoneNumber,
          contact.userInitials,
          contact.userColor
        );

        // Rebind die Buttons für die aktualisierte BigCard
        const { bindButton } = await import('./contactUtils.js');
        const { deleteContactFromDatabase } = await import('./contactDataService.js');
        const { openEditDialog } = await import('./contactEditor.js');
        bindButton(bigContact, "#delete", () => deleteContactFromDatabase(contact.userId, contact.userFullName));
        bindButton(bigContact, "#edit", () => openEditDialog(contact));
      }

      closeEditWindow();
      console.log("Kontakt erfolgreich aktualisiert");
    } else {
      console.error("Fehler beim Aktualisieren des Kontakts:", response.status);
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontakts:", error);
  }
}

/**
 * Löscht Kontakt aus Firebase
 * @param {string} userId - User ID
 * @param {string} userName - Benutzername für Task-Bereinigung
 */
export async function deleteContactFromDatabase(userId, userName) {
  const response = await fetch(`${BASE_URL}/contacts/${userId}.json`, {
    method: 'DELETE'
  });

  if (response.ok) {
    // Update globale contactList
    if (window.contactList) {
      window.contactList = window.contactList.filter(c => c.userId !== userId);
    }

    // TODO: Task-Bereinigung implementieren falls nötig
    // await removeUserFromAllTasks(userName);

    handlePostDeleteView(window.contactList || []);
  }
}

/**
 * Lädt aktuellen Benutzer aus localStorage als Kontakt-Objekt
 */
async function getCurrentUserAsContact() {
  try {
    const currentUserString = localStorage.getItem("currentUser");
    if (!currentUserString) return null;
    
    const userData = JSON.parse(currentUserString);
    
    return {
      userFullName: userData.userFullName || userData.name || "Aktueller Benutzer",
      userEmailAddress: userData.userEmailAddress || userData.email || "",
      userPhoneNumber: userData.userPhoneNumber || userData.phone || "",
      userInitials: userData.userInitials || getInitialsFromName(userData.userFullName || userData.name || "AB"),
      firstCharacter: (userData.userFullName || userData.name || "A").charAt(0).toUpperCase(),
      userId: userData.userId || userData.id || "current-user",
      userColor: userData.userColor || "color-1"
    };
  } catch (error) {
    console.error("Fehler beim Laden des aktuellen Benutzers:", error);
    return null;
  }
}

/**
 * Erstellt Initialen aus Namen
 */
function getInitialsFromName(fullName) {
  if (!fullName?.trim()) return "AB";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1 ? 
    names[0].charAt(0).toUpperCase() : 
    names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}
