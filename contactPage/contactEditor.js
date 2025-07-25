/**
 * Kontakt-Editor für Bearbeitungsfunktionalität
 */

/**
 * Füllt Bearbeitungsformular
 * @param {Object} contact - Kontaktdaten
 */
function fillEditForm(contact) {
  document.getElementById("contactNameEdit").value = contact.userFullName;
  document.getElementById("contactEmailEdit").value = contact.userEmailAddress;
  document.getElementById("contactPhoneEdit").value = contact.userPhoneNumber;
}

/**
 * Holt Bearbeitungseingaben
 * @returns {Object} Eingabedaten
 */
function getEditContactInput() {
  return {
    userFullName: document.getElementById("contactNameEdit").value.trim(),
    userEmailAddress: document.getElementById("contactEmailEdit").value.trim(),
    userPhoneNumber: document.getElementById("contactPhoneEdit").value.trim()
  };
}

/**
 * Behandelt Kontakt-Bearbeitungsübermittlung
 * @param {Event} e - Submit Event
 */
function handleContactEditSubmission(e) {
  e.preventDefault();
  const contact = editingContact;
  const updated = getEditContactInput();
  
  updated.userInitials = getInitials(updated.userFullName);
  updated.firstCharacter = updated.userFullName.charAt(0).toUpperCase();
  updated.userColor = contact.userColor;

  updateContact(contact, updated);
}

/**
 * Leert Eingabefelder
 */
function emptyInput() {
  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
}

/**
 * Öffnet Bearbeitungsdialog
 * @param {Object} contact - Zu bearbeitender Kontakt
 */
function openEditDialog(contact) {
  editingContact = contact;
  fillEditForm(contact);
  document.getElementById("myModalEdit").style.display = "block";
  document.getElementById("myModalBgEdit").style.display = "block";
}
