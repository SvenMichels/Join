/**
 * Displays and manages contact list rendering.
 * @fileoverview Contact rendering functionality for displaying and managing contact lists
 * @module contactRenderer
 */

let alphabetLettersUsedSet = new Set();

/**
 * Renders all contacts from the given list.
 * @description Processes and displays a complete list of contacts with alphabet filtering
 * @param {Array} contactList - Array of contact objects.
 * @returns {void}
 */
import { refreshUI } from './contactDataService.js';
export function renderAllContacts(contactList) {

  const contacts = normalizeContactList(contactList);
  if (!Array.isArray(contacts)) return;

  const sortedContacts = sortContactsByName(contacts);
  sortedContacts.forEach(renderValidContact);
}

/**
 * Normalizes the contact list input.
 * @description Ensures the contact list is a valid array format
 * @param {*} list - Input list to normalize
 * @returns {Array} Normalized contact array
 * @private
 */
function normalizeContactList(list) {
  if (!Array.isArray(list)) return [];
  if (list.length === 0) return [];
  return list;
}

/**
 * Sorts contacts alphabetically by name.
 * @description Creates a sorted copy of contacts ordered by full name
 * @param {Array<Object>} contacts - Array of contact objects
 * @returns {Array<Object>} Sorted array of contacts
 * @private
 */
function sortContactsByName(contacts) {
  return contacts.slice().sort((a, b) => a.userFullName.localeCompare(b.userFullName));
}

/**
 * Renders a valid contact object.
 * @description Validates and renders a single contact if it has required properties
 * @param {Object} contact - Contact object to render
 * @returns {void}
 * @private
 */
function renderValidContact(contact) {
  if (!contact?.userFullName) return;

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

/**
 * Gets the contacts container element.
 * @description Finds and returns the main container for contact list display
 * @returns {HTMLElement|null} The contacts container element or null if not found
 * @private
 */
function getContactsContainer() {
  return document.getElementById("allContacts") || document.querySelector(".contact-list");
}

/**
 * Renders a single contact card and its alphabet filter letter.
 * @description Creates and displays a contact card with alphabet grouping
 * @param {string} name - Full name of the contact.
 * @param {string} email - Email address.
 * @param {string} phone - Phone number.
 * @param {string} initials - Initials of the contact.
 * @param {string} firstChar - First letter of the name (used for alphabet filter).
 * @param {string|number} id - Unique ID of the contact.
 * @param {string} color - Color class of the contact.
 * @returns {void}
 */
export function renderContact(name, email, phone, initials, firstChar, id, color) {
  renderAlphabetFilter(firstChar);
  const container = getContactsContainer();
  if (!container) return;
  const html = renderContactCard(name, email, initials, id, color, phone);
  container.innerHTML += html;
}

/**
 * Renders a new alphabet letter heading if not already rendered.
 * @description Adds alphabet section headers for contact grouping
 * @param {string} letter - First letter of a contact name.
 * @returns {void}
 */
export function renderAlphabetFilter(letter) {
  if (!alphabetLettersUsedSet.has(letter)) {
    alphabetLettersUsedSet.add(letter);
    const container = getContactsContainer();
    if (!container) return;
    container.innerHTML += `<div class="startLetter"><h2>${letter}</h2></div>`;
  }
}

/**
 * Generates the HTML string for a contact card.
 * @description Creates the HTML markup for displaying a single contact
 * @param {string} name - Full name.
 * @param {string} email - Email address.
 * @param {string} initials - Initials.
 * @param {string|number} id - Unique contact ID.
 * @param {string} color - Color class.
 * @param {string} phone - Phone number.
 * @returns {string} HTML markup for the contact card.
 */
export function renderContactCard(name, email, initials, id, color, phone) {
  return `
    <div class="contact" onclick="window.renderSingleContact('${name}', '${email}', '${phone}', '${initials}', '${id}', '${color}')">
      <div class="pic ${color}">
        <span>${initials}</span>
      </div>
      <div class="contact-text">
        <span class="name">${name}</span>
        <span class="mail">${email}</span>
      </div>
    </div>`;
}

/**
 * Clears the entire contact list UI.
 * @description Removes all rendered contacts and resets alphabet filter state
 * @returns {void}
 */
export function clearContactListUI() {
  const container = getContactsContainer();
  if (!container) return;
  container.innerHTML = "";
  alphabetLettersUsedSet.clear();
}

/**
 * Clears the big contact detail view.
 * @description Removes content from the detailed contact view container
 * @returns {void}
 */
export function clearBigContactView() {
  document.getElementById("bigContact").innerHTML = "";
}
