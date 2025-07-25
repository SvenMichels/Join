import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";

export async function createContact(contactData) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("Kein eingeloggter Benutzer");

  const apiPath = `contacts/${currentUserData.id}`;
  const creationResult = await requestData("POST", apiPath, contactData);
  return creationResult;
}

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

function getCurrentUserData() {
  const currentUserString = localStorage.getItem("currentUser");
  return JSON.parse(currentUserString);
}

async function fetchContactsFromFirebase(userId) {
  const response = await requestData("GET", `contacts/${userId}`);
  return response.data;
}

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

function ensureCurrentUserInContactsList(contactsList, currentUserData) {
  const userExistsInContacts = contactsList.some(contact => contact.userId === currentUserData.id);
  
  if (!userExistsInContacts) {
    contactsList.unshift(createUserContactObject(currentUserData));
  }
  
  return contactsList;
}

export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) {
    throw new Error("Kein eingeloggter Benutzer");
  }
  
  await requestData("PUT", `contacts/${user.id}/${contact.userId}`, contact);
}

export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const deleteResult = await requestData("DELETE", `contacts/${user.id}/${contactId}`);
}

export async function loadAllUsersForLogin() {
  const usersData = await fetchUsersFromDatabase();
  return transformUsersForLogin(usersData);
}

async function fetchUsersFromDatabase() {
  const response = await requestData("GET", "users");
  if (!response.data) return {};
  return response.data;
}

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