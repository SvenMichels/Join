import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";


/**
 * Erstellt einen neuen Kontakt für den aktuell eingeloggten Benutzer.
 * 
 * Diese Funktion:
 * - Liest den aktuellen Benutzer aus dem `localStorage`
 * - Validiert, ob ein Benutzer eingeloggt ist
 * - Sendet die Kontaktdaten per POST-Request an die API unter `/contacts/{userId}`
 *
 * @async
 * @function createContact
 * @param {Object} contactData - Das Kontaktobjekt mit den zu speichernden Daten.
 * @returns {Promise<Object>} Das Ergebnis des API-Requests (z. B. gespeicherter Kontakt oder Serverantwort).
 *
 * @throws {Error} Wenn kein Benutzer im `localStorage` gefunden wird oder keine Benutzer-ID existiert.
 *
 * @example
 * const contact = {
 *   userFullName: "Max Mustermann",
 *   userEmailAddress: "max@example.com",
 *   userPhoneNumber: "0123456789"
 * };
 * const result = await createContact(contact);
 */
export async function createContact(contactData) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("Kein eingeloggter Benutzer");

  const apiPath = `contacts/${currentUserData.id}`;
  const creationResult = await requestData("POST", apiPath, contactData);
  return creationResult;
}

/**
 * Lädt alle Kontakte des aktuell eingeloggten Benutzers aus der Datenbank.
 * 
 * Diese Funktion:
 * - Holt die Benutzerdaten über `getCurrentUserData()`
 * - Ruft die Kontaktliste aus Firebase ab
 * - Verarbeitet die rohen Kontaktdaten in ein nutzbares Format
 * - Stellt sicher, dass der aktuelle Benutzer in der Kontaktliste enthalten ist
 * - Gibt die vollständige Liste der Kontakte zurück
 *
 * @async
 * @function loadContacts
 * @returns {Promise<Object[]>} Ein Array von Kontaktobjekten, mindestens mit dem aktuellen Benutzer.
 *
 * @example
 * const contacts = await loadContacts();
 * console.log(contacts); // → Array von Kontaktobjekten
 */
export async function loadContacts() {
  const currentUserData = getCurrentUserData();
  if (!currentUserData?.id) return [];

  const contactsRawData = await fetchContactsFromFirebase(currentUserData.id);
  
  if (!contactsRawData) {
    return [createUserContactObject(currentUserData)];
  }

  const processedContactsList = processContactsData(contactsRawData);
  return ensureCurrentUserInContactsList(processedContactsList, currentUserData);
}

/**
 * Gibt die im `localStorage` gespeicherten Daten des aktuell eingeloggten Benutzers zurück.
 *
 * @function getCurrentUserData
 * @returns {Object|null} Das Benutzerobjekt oder `null`, wenn keine Daten vorhanden sind.
 *
 * @example
 * const user = getCurrentUserData();
 * if (user) console.log(user.userFullName);
 */
function getCurrentUserData() {
  const currentUserString = localStorage.getItem("currentUser");
  return JSON.parse(currentUserString);
}

/**
 * Holt die Kontaktdaten eines Benutzers aus der Firebase-Datenbank.
 *
 * @async
 * @function fetchContactsFromFirebase
 * @param {string|number} userId - Die ID des Benutzers, dessen Kontakte geladen werden sollen.
 * @returns {Promise<Object|null>} Die rohen Kontaktdaten oder `null`, falls keine Daten vorhanden sind.
 *
 * @example
 * const contacts = await fetchContactsFromFirebase(123);
 */
async function fetchContactsFromFirebase(userId) {
  const response = await requestData("GET", `contacts/${userId}`);
  return response.data;
}

/**
 * Erstellt ein standardisiertes Kontaktobjekt aus Benutzerdaten.
 *
 * Falls Initialen oder der erste Buchstabe fehlen, werden sie automatisch generiert.
 *
 * @function createUserContactObject
 * @param {Object} userData - Das Benutzerobjekt mit den verfügbaren Feldern.
 * @param {string} userData.userFullName - Vollständiger Name des Benutzers.
 * @param {string} userData.userEmailAddress - E-Mail-Adresse.
 * @param {string} userData.userPhoneNumber - Telefonnummer.
 * @param {string} [userData.userInitials] - Optional: Initialen des Benutzers.
 * @param {string} [userData.firstCharacter] - Optional: Erster Buchstabe des Namens.
 * @param {string|number} userData.id - Benutzer-ID.
 * @param {string} userData.userColor - Zugeordnete Benutzerfarbe.
 * 
 * @returns {Object} Ein Objekt mit formatierten Kontaktdaten.
 *
 * @example
 * const contact = createUserContactObject(currentUser);
 */
function createUserContactObject(userData) {
  return {
    userFullName: userData.userFullName,
    userEmailAddress: userData.userEmailAddress,
    userPhoneNumber: userData.userPhoneNumber,
    userInitials: userData.userInitials || getInitials(userData.userFullName),
    firstCharacter: userData.firstCharacter || userData.userFullName?.charAt(0).toUpperCase() || "?",
    userId: userData.id,
    userColor: userData.userColor
  };
}

/**
 * Wandelt rohe Kontaktdaten aus der Datenbank in ein Array formatierter Kontaktobjekte um.
 * 
 * @function processContactsData
 * @param {Object} contactsRawData - Die rohen Kontaktdaten aus der Datenbank (z. B. Firebase).
 * @returns {Object[]} Array von formatierten Kontaktobjekten mit Benutzerinformationen.
 *
 * @example
 * const contacts = processContactsData(rawData);
 */
function processContactsData(contactsRawData) {
  const contactEntriesArray = Object.entries(contactsRawData);
  
  return contactEntriesArray.map(([id, contact]) => ({
    userFullName: contact.userFullName,
    userEmailAddress: contact.userEmailAddress,
    userPhoneNumber: contact.userPhoneNumber,
    userInitials: contact.userInitials,
    firstCharacter: contact.firstCharacter,
    userId: id,
    userColor: contact.userColor
  }));
}

/**
 * Stellt sicher, dass der aktuell eingeloggte Benutzer in der Kontaktliste enthalten ist.
 * 
 * Falls nicht vorhanden, wird der Benutzer an den Anfang der Liste eingefügt.
 * 
 * @function ensureCurrentUserInContactsList
 * @param {Object[]} contactsList - Liste von Kontaktobjekten.
 * @param {Object} currentUserData - Daten des aktuell eingeloggten Benutzers.
 * @returns {Object[]} Die aktualisierte Kontaktliste.
 *
 * @example
 * const safeList = ensureCurrentUserInContactsList(contacts, currentUser);
 */
function ensureCurrentUserInContactsList(contactsList, currentUserData) {
  const userExistsInContacts = contactsList.some(contact => contact.userId === currentUserData.id);
  
  if (!userExistsInContacts) {
    contactsList.unshift(createUserContactObject(currentUserData));
  }
  
  return contactsList;
}

/**
 * Aktualisiert einen bestehenden Kontakt in der Firebase-Datenbank.
 * 
 * @async
 * @function updateContactInFirebase
 * @param {Object} contact - Das zu aktualisierende Kontaktobjekt.
 * @throws {Error} Wenn kein eingeloggter Benutzer im `localStorage` gefunden wird.
 *
 * @example
 * await updateContactInFirebase(updatedContact);
 */
export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) {
    throw new Error("Kein eingeloggter Benutzer");
  }
  
  await requestData("PUT", `contacts/${user.id}/${contact.userId}`, contact);
}

/**
 * Löscht einen Kontakt aus der Firebase-Datenbank für den aktuell eingeloggten Benutzer.
 * 
 * @async
 * @function deleteContactFromFirebase
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 * @returns {Promise<void>} Keine Rückgabe, Aktion wird nur ausgeführt.
 *
 * @example
 * await deleteContactFromFirebase("contact123");
 */
export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const deleteResult = await requestData("DELETE", `contacts/${user.id}/${contactId}`);
}

/**
 * Lädt alle Benutzer aus der Datenbank und bereitet sie für den Login vor.
 *
 * @async
 * @function loadAllUsersForLogin
 * @returns {Promise<Object[]>} Ein Array vorbereiteter Benutzerobjekte.
 *
 * @example
 * const users = await loadAllUsersForLogin();
 */
export async function loadAllUsersForLogin() {
  const usersData = await fetchUsersFromDatabase();
  return transformUsersForLogin(usersData);
}

/**
 * Ruft alle Benutzerdaten aus der Datenbank ab.
 *
 * @async
 * @function fetchUsersFromDatabase
 * @returns {Promise<Object>} Ein Objekt mit allen Benutzerdaten oder ein leeres Objekt.
 *
 * @example
 * const usersData = await fetchUsersFromDatabase();
 */
async function fetchUsersFromDatabase() {
  const response = await requestData("GET", "users");
  if (!response.data) return {};
  return response.data;
}

/**
 * Wandelt rohe Benutzerdaten aus der Datenbank in ein formatgerechtes Login-Array um.
 *
 * @function transformUsersForLogin
 * @param {Object} usersData - Die rohen Benutzerdaten (Key-Value-Format).
 * @returns {Object[]} Array von Benutzerobjekten mit allen nötigen Feldern für den Login.
 *
 * @example
 * const users = transformUsersForLogin(data);
 */
function transformUsersForLogin(usersData) {
  const userEntries = Object.entries(usersData);
  
  return userEntries.map(([id, user]) => ({
    userId: id,
    userFullName: user.userFullName,
    userEmailAddress: user.userEmailAddress,
    userPassword: user.userPassword,
    userPhoneNumber: user.userPhoneNumber,
    userInitials: user.userInitials,
    firstCharacter: user.firstCharacter,
    userColor: user.userColor
  }));
}

/**
 * Load contacts for task assignment (used in modals and task creation)
 * Single responsibility: Provide unified contact data for task assignments
 * @returns {Array} Array of contact objects in unified format
 */
export async function loadContactsForTaskAssignment() {
  try {
    const contacts = await loadContacts();
    return contacts || [];
  } catch (error) {
    console.error("Error loading contacts for task assignment:", error);
    return [];
  }
}