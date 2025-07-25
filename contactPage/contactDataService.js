/**
 * Kontakt-Datenservice für Firebase-Operationen
 */

/**
 * Lädt alle Kontakte aus Firebase
 */
async function loadAllContactsFromFirebaseDatabase() {
  try {
    const allContacts = await getAllContactsFromDatabase();
    contactList = allContacts;
    clearContactListUI();
    renderAllContacts(contactList);
  } catch (error) {
    console.error('Error loading contacts:', error);
  }
}

/**
 * Erstellt neuen Kontakt in Firebase
 * @param {Object} contact - Kontaktdaten
 * @returns {Promise} Firebase Response
 */
async function createContact(contact) {
  const response = await fetch(`${BASE_URL}/contacts.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact)
  });
  return response.json();
}

/**
 * Aktualisiert existierenden Kontakt
 * @param {Object} contact - Originalkontakt
 * @param {Object} updated - Aktualisierte Daten
 */
async function updateContact(contact, updated) {
  try {
    await putData(`contacts/${contact.userId}`, updated);
    Object.assign(contact, updated);
    clearContactListUI();
    renderAllContacts(contactList);
    closeEditWindow();
  } catch (error) {
    console.error('Error updating contact:', error);
  }
}

/**
 * Löscht Kontakt aus Firebase
 * @param {string} userId - User ID
 * @param {string} userName - Benutzername für Task-Bereinigung
 */
async function deleteContactFromDatabase(userId, userName) {
  try {
    await deleteData(`contacts/${userId}`);
    await removeUserFromAllTasks(userName);
    contactList = contactList.filter(c => c.userId !== userId);
    handlePostDeleteView(contactList);
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}
