import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Creates a new contact for the currently logged-in user.
 * 
 * This function:
 * - Reads the current user from localStorage
 * - Validates that a user is logged in
 * - Sends the contact data via POST to `/contacts/{userId}`
 *
 * @async
 * @function createContact
 * @param {Object} contactData - The contact object to store.
 * @returns {Promise<Object>} The result of the API request (e.g. saved contact or response).
 * @throws {Error} If no user is found in localStorage or user ID is missing.
 */
export async function createContact(contactData) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");

  const apiPath = `contacts/${currentUserData.id}`;
  const creationResult = await requestData("POST", apiPath, contactData);
  return creationResult;
}

/**
 * Loads all contacts of the currently logged-in user from the database.
 *
 * @async
 * @function loadContacts
 * @returns {Promise<Object[]>} An array of contact objects, including the current user.
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
 * Returns the current user data from localStorage.
 * 
 * @function getCurrentUserData
 * @returns {Object|null} The user object or null if not found.
 */
function getCurrentUserData() {
  const currentUserString = localStorage.getItem("currentUser");
  return JSON.parse(currentUserString);
}

/**
 * Fetches contacts for a given user ID from Firebase.
 *
 * @async
 * @function fetchContactsFromFirebase
 * @param {string|number} userId - The user ID whose contacts are to be loaded.
 * @returns {Promise<Object|null>} Raw contact data or null if not found.
 */
async function fetchContactsFromFirebase(userId) {
  const response = await requestData("GET", `contacts/${userId}`);
  return response.data;
}

/**
 * Creates a standardized contact object from user data.
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
    userColor: userData.userColor
  };
}

/**
 * Converts raw contact data into an array of formatted contact objects.
 * 
 * @function processContactsData
 * @param {Object} contactsRawData - Raw contact data (e.g. from Firebase).
 * @returns {Object[]} Array of formatted contact objects.
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
 * Ensures that the currently logged-in user is present in the contacts list.
 * If not, adds the user to the beginning of the list.
 * 
 * @function ensureCurrentUserInContactsList
 * @param {Object[]} contactsList - Array of contact objects.
 * @param {Object} currentUserData - The current user data.
 * @returns {Object[]} The updated contacts list.
 */
function ensureCurrentUserInContactsList(contactsList, currentUserData) {
  const userExistsInContacts = contactsList.some(contact => contact.userId === currentUserData.id);
  
  if (!userExistsInContacts) {
    contactsList.unshift(createUserContactObject(currentUserData));
  }
  
  return contactsList;
}

/**
 * Updates a contact in the Firebase database.
 *
 * @async
 * @function updateContactInFirebase
 * @param {Object} contact - The contact object to update.
 * @throws {Error} If no user is found in localStorage.
 */
export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) {
    throw new Error("No user logged in");
  }
  
  await requestData("PUT", `contacts/${user.id}/${contact.userId}`, contact);
}

/**
 * Deletes a contact from the Firebase database for the current user.
 *
 * @async
 * @function deleteContactFromFirebase
 * @param {string} contactId - ID of the contact to delete.
 * @returns {Promise<void>} No return, only executes the action.
 */
export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const deleteResult = await requestData("DELETE", `contacts/${user.id}/${contactId}`);
}

/**
 * Loads all users from the database and prepares them for login.
 *
 * @async
 * @function loadAllUsersForLogin
 * @returns {Promise<Object[]>} Array of user objects.
 */
export async function loadAllUsersForLogin() {
  const usersData = await fetchUsersFromDatabase();
  return transformUsersForLogin(usersData);
}

/**
 * Fetches all users from the Firebase database.
 *
 * @async
 * @function fetchUsersFromDatabase
 * @returns {Promise<Object>} Object containing all user entries or empty object.
 */
async function fetchUsersFromDatabase() {
  const response = await requestData("GET", "users");
  if (!response.data) return {};
  return response.data;
}

/**
 * Transforms raw Firebase user data into an array for login usage.
 *
 * @function transformUsersForLogin
 * @param {Object} usersData - Raw user data as key-value pairs.
 * @returns {Object[]} Array of formatted user objects.
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
 * Loads contacts for task assignment (used in modals and task creation).
 * 
 * @async
 * @function loadContactsForTaskAssignment
 * @returns {Promise<Object[]>} Array of contact objects in a unified format.
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
