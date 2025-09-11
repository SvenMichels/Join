import { getInitials } from "../scripts/utils/helpers.js";
import { renderContact } from "./contactRenderer.js";
import { openEditWindow } from "./contacts.js";
import { LocalStorageService } from "../scripts/utils/localStorageHelper.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
});

/**
 * Renders the contact card of the currently logged-in user
 * and attaches an event listener to the edit button.
 */
async function currentUserCard() {
  const userData = LocalStorageService.getItem("currentUser");
  if (!userData) return;

  const contact = extractContactInformation(userData);
  renderContactCard(contact);
  await bindEditButton(() => openEditWindow());
}

function renderContactCard(contact) {
  renderContact(
    contact.userFullName,
    contact.userEmailAddress,
    contact.userPhoneNumber,
    contact.userInitials,
    contact.firstCharacter,
    contact.userId,
    contact.userColor
  );
}

function bindEditButton(callback) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const editBtn = document.getElementById("editContact");
      if (editBtn) {
        editBtn.addEventListener("click", callback);
      }
      resolve();
    });
  });
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
  const userPassword = userData.userPassword;

  return {
    userFullName,
    userEmailAddress,
    userPhoneNumber,
    userInitials,
    firstCharacter,
    userId,
    userColor,
    userPassword
  };
}
