import { requestData } from "../firebase.js";
import { updateTaskWithoutUser } from "../../contactPage/contactsMain.js";

/**
 * Sends a POST request to create a new user in the database.
 *
 * @param {Object} newUserData - The user data to store.
 * @returns {Promise<Object>} The response from the database.
 */
export async function createNewUserAccount(newUserData) {
  const databaseResponse = await requestData("POST", "users", newUserData);
  return databaseResponse;
}

/**
 * Retrieves user data by user ID from the database.
 *
 * @param {string} userIdentifier - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user data.
 */
export async function getUserDataById(userIdentifier) {
  const userDataResponse = await requestData("GET", `/users/${userIdentifier}`);
  return userDataResponse.data;
}

/**
 * Updates user information in the database.
 *
 * @param {string} userIdentifier - The ID of the user to update.
 * @param {Object} updatedUserData - The updated user data.
 * @returns {Promise<Object>} The response from the database.
 */
export async function updateUserInformation(userIdentifier, updatedUserData) {
  return await requestData("PATCH", `users/${userIdentifier}`, updatedUserData);
}

/**
 * Deletes a user account from the database.
 *
 * @param {string} userIdentifier - The ID of the user to delete.
 * @returns {Promise<Object>} The response from the database.
 */
export async function deleteUserAccount(userIdentifier) {

  tasks = await requestData("GET", `/tasks/`);
  updateTaskWithoutUser(tasks, userIdentifier);
  return await requestData("DELETE", `/users/${userIdentifier}`);
}