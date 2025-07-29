/**
 * Kontakt bearbeiten
 */

import { getInitials } from '../scripts/utils/helpers.js';
import { updateContact } from './contactDataService.js';

let editingContact = null;

/**
 * Formular mit Kontaktdaten füllen
 */
export function fillEditForm(contact) {
  setTimeout(() => {
    document.getElementById("editContactName").value = contact.userFullName || "";
    document.getElementById("editContactEmail").value = contact.userEmailAddress || "";
    document.getElementById("editContactPhone").value = contact.userPhoneNumber || "";
  }, 100);
}

/**
 * Eingaben aus Formular holen
 */
export function getEditContactInput() {
  return {
    userFullName: document.getElementById("editContactName").value.trim(),
    userEmailAddress: document.getElementById("editContactEmail").value.trim(),
    userPhoneNumber: document.getElementById("editContactPhone").value.trim()
  };
}

/**
 * Kontakt speichern
 */
export function handleContactEditSubmission(e) {
  e.preventDefault();
  const contact = editingContact;
  const updated = getEditContactInput();
  
  updated.userInitials = getInitials(updated.userFullName);
  updated.firstCharacter = updated.userFullName.charAt(0).toUpperCase();
  updated.userColor = contact.userColor;

  updateContact(contact, updated);
}

/**
 * Felder leeren
 */
export function emptyInput() {
  const fields = ["contactName", "contactEmail", "contactPhone", "editContactName", "editContactEmail", "editContactPhone"];
  fields.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
}

/**
 * Bearbeitung starten
 */
export function openEditDialog(contact) {
  editingContact = contact;
  const editWindow = document.getElementById("editWindow");
  if (editWindow) {
    editWindow.classList.remove("dp-none");
    fillEditForm(contact);
  }
}
