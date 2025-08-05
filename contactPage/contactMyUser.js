import { getInitials } from "../scripts/utils/helpers.js";
import { renderContact } from "./contactRenderer.js";
import { openEditWindow } from "./contacts.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
});

/**
 * Renders the contact card of the currently logged-in user
 * and attaches an event listener to the edit button.
 *
 * This function:
 * - Loads the current user data from `localStorage`
 * - Extracts contact info via `extractContactInformation()`
 * - Renders the contact card using `renderContact()`
 * - Adds a click listener to the button with ID `editContact` after rendering
 *
 * @async
 * @function currentUserCard
 * @returns {Promise<void>} No return value. Manipulates the DOM.
 *
 * @example
 * await currentUserCard();
 */

// TODO: REFACTOR: This function is too large and does too many things. Consider breaking it down into smaller functions.
async function currentUserCard() {
  const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUserData) return;

  const contactData = extractContactInformation(currentUserData);

  renderContact(
    contactData.userFullName,
    contactData.userEmailAddress,
    contactData.userPhoneNumber,
    contactData.userInitials,
    contactData.firstCharacter,
    contactData.userId,
    contactData.userColor
  );

  // Add event listener AFTER rendering
  setTimeout(() => {
    const editBtn = document.getElementById("editContact");
    if (editBtn) {
      editBtn.addEventListener("click", () => openEditWindow());
    }
  }, 100);
}

/**
 * Extracts relevant contact information from a user object.
 * 
 * Converts a user object into a structured object used for rendering
 * a contact card.
 *
 * @function extractContactInformation
 * @param {Object} userData - The user object with stored user data.
 * @param {string} userData.userFullName - Full name of the user.
 * @param {string} userData.userEmailAddress - User's email address.
 * @param {string} userData.userPhoneNumber - User's phone number.
 * @param {string} userData.userColor - Color assigned to the user.
 * @param {string|number} userData.id - Unique user ID.
 *
 * @returns {Object} Object containing extracted contact data:
 * @returns {string} return.userFullName - Full name.
 * @returns {string} return.userEmailAddress - Email address.
 * @returns {string} return.userPhoneNumber - Phone number.
 * @returns {string} return.userInitials - Initials from name.
 * @returns {string} return.firstCharacter - First letter of name (uppercase).
 * @returns {string|number} return.userId - User ID.
 * @returns {string} return.userColor - Assigned color.
 *
 * @example
 * const contactData = extractContactInformation(currentUser);
 */
function extractContactInformation(userData) {
  const userFullName = userData.userFullName;
  const userEmailAddress = userData.userEmailAddress;
  const userPhoneNumber = userData.userPhoneNumber;
  const userInitials = getInitials(userData.userFullName);
  const firstCharacter = userData.userFullName ? userData.userFullName.charAt(0).toUpperCase() : "?";
  const userId = userData.id;
  const userColor = userData.userColor;

  return {
    userFullName,
    userEmailAddress,
    userPhoneNumber,
    userInitials,
    firstCharacter,
    userId,
    userColor
  };
}
