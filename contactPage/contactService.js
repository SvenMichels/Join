import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";



/**
 * Erstellt einen neuen User (Kontakte = alle User).
 *
 * Sendet die Daten via POST an `/users`.
 *
 * @async
 * @function createContact
 * @param {Object} contactData 
 * @returns {Promise<Object>} 
 * @throws {Error} 
 */
export async function createContact(contactData) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");
  const normalized = {
    ...contactData,
    userInitials: contactData.userInitials || getInitials(contactData.userFullName),
    firstCharacter:
      contactData.firstCharacter ||
      contactData.userFullName?.charAt(0).toUpperCase() ||
      "?",
  };

  const apiPath = `users`;
  const creationResult = await requestData("POST", apiPath, normalized);
  return creationResult;
}

/**
 *
 * @async
 * @function loadContacts
 * @returns {Promise<Object[]>}
 */
export async function loadContacts() {
  const currentUserData = getCurrentUserData();

  const usersRawData = await fetchUsersFromFirebase();
  const contactsList = convertUsersToContacts(usersRawData);
  if (!currentUserData?.id) return contactsList;

  return ensureCurrentUserInContactsList(contactsList, currentUserData);
}

/**

 * 
 * @function getCurrentUserData
 * @returns {Object|null} 
 */
function getCurrentUserData() {
  try {
    const currentUserString = localStorage.getItem("currentUser");
    return JSON.parse(currentUserString);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

async function fetchUsersFromFirebase() {
  try {
    const usersResult = await requestData("GET", "users");
    return usersResult.data || {};
  } catch (error) {
    console.error("Error fetching users:", error);
    return {};
  }
}

/**
 * Creates a contact object from user data.
 *
 * @function createUserContactObject
 * @param {Object} userData - The user object with fields.
 * @returns {Object} A formatted contact object.
 */
function createUserContactObject(userData) {
  return {
    userFullName: userData.userFullName,
    userEmailAddress: userData.userEmailAddress,
    userPhoneNumber: userData.userPhoneNumber,
    userInitials: userData.userInitials || getInitials(userData.userFullName),
    firstCharacter: userData.firstCharacter || userData.userFullName?.charAt(0).toUpperCase() || "?",
    userId: userData.id,
    userColor: userData.userColor,
    userPassword: userData.userPassword || ""
  };
}

/**
 * Ensures the current user is in the contacts list.
 * If not, adds the user to the beginning of the list.
 * 
 * @function ensureCurrentUserInContactsList
 * @param {Object[]} contactsList - Array of contact objects.
 * @param {Object} currentUserData - The current user data.
 * @returns {Object[]} The updated contacts list.
 */
function ensureCurrentUserInContactsList(contactsList, currentUserData) {
  const userExistsInContacts = contactsList.some(contact =>
    contact.userId === currentUserData.id ||
    contact.userEmailAddress === currentUserData.userEmailAddress ||
    contact.userFullName === currentUserData.userFullName
  );

  if (!userExistsInContacts) {
    contactsList.unshift(createUserContactObject(currentUserData));
  }
  return contactsList;

}

/**
 * Aktualisiert einen User (Kontakte = alle User).
 *
 * @async
 * @function updateContactInFirebase
 * @param {Object} contact
 * @throws {Error}
 */
export async function updateContactInFirebase(contact) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");

  const apiPath = `users/${contact.id}`;
  const updateResult = await requestData("PATCH", apiPath, {
    ...contact,
    userInitials: contact.userInitials || getInitials(contact.userFullName),
    firstCharacter:
      contact.firstCharacter ||
      contact.userFullName?.charAt(0).toUpperCase() ||
      "?",
    userPassword: contact.userPassword || '',
  });
  return updateResult;
}

/**
 *
 * @async
 * @function deleteContactFromFirebase
 * @param {string} contactId
 * @throws {Error}
 */
export async function deleteContactFromFirebase(contactId) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");

  const apiPath = `users/${contactId}`;
  const deleteResult = await requestData("DELETE", apiPath);
  return deleteResult;
}

/**
 * Loads contacts for task assignment (used in modals and task creation).
 * 
 * @async
 * @function loadContactsForTaskAssignment
 * @returns {Promise<Object[]>} 
 */
export async function loadContactsForTaskAssignment() {
  try {
    const contacts = await loadContacts();

    return contacts || [];
  } catch (error) {
    return [];
  }
}

function convertUsersToContacts(usersData) {
  return Object.entries(usersData).map(([id, user]) => ({
    userFullName: user.userFullName,
    userEmailAddress: user.userEmailAddress,
    userPhoneNumber: user.userPhoneNumber,
    userInitials: user.userInitials || getInitials(user.userFullName),
    firstCharacter: user.firstCharacter || user.userFullName?.charAt(0).toUpperCase() || "?",
    userId: id,
    userColor: user.userColor,
    userPassword: user.userPassword || ""
  }));
}
