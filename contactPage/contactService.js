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
 * @returns {Object|null} The current user data or null if not found.
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

/**
 * Fetches contacts from Firebase for a specific user.
 * 
 * @async
 * @function fetchContactsFromFirebase
 * @param {string} userId - The user ID to fetch contacts for.
 * @returns {Promise<Object|null>} Raw contact data from Firebase or null if not found.
 */
async function fetchContactsFromFirebase(userId) {
  try {
    const contactsData = await requestData("GET", `contacts/${userId}`);
    return contactsData.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return null;
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

// TODO: REFACTOR: This function is too large and does too many things. Consider breaking it down into smaller functions.
function processContactsData(contactsRawData) {
  const contactEntriesArray = Object.entries(contactsRawData);
  
  const formattedContacts = contactEntriesArray
    .filter(([contactKey, contactValue]) => {
      // Filter out Firebase metadata like 'status', 'data', etc.
      // Only process entries that look like contact objects
      return contactValue && 
             typeof contactValue === 'object' && 
             contactValue.userFullName && 
             !['status', 'data', 'error'].includes(contactKey);
    })
    .map(([contactKey, contactValue]) => ({
      id: contactKey,
      ...contactValue
    }));

  return formattedContacts;
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
  return contactsList ;
  
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
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");

  const apiPath = `contacts/${currentUserData.id}/${contact.id}`;
  const updateResult = await requestData("PUT", apiPath, contact);
  return updateResult;
}

/**
 * Deletes a contact from the Firebase database.
 *
 * @async
 * @function deleteContactFromFirebase
 * @param {string} contactId - The ID of the contact to delete.
 * @throws {Error} If no user is found in localStorage.
 */
export async function deleteContactFromFirebase(contactId) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("No user logged in");

  const apiPath = `contacts/${currentUserData.id}/${contactId}`;
  const deleteResult = await requestData("DELETE", apiPath);
  return deleteResult;
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
    // console.log("[ContactService] Contacts loaded for task assignment:", contacts);
    
    return contacts || [];
  } catch (error) {
    return [];
  }
}
