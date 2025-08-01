/**
 * Displays and manages contact list rendering.
 */

let alphabetLettersUsedSet = new Set();

/**
 * Renders all contacts from the given list.
 *
 * @param {Array} contactList - Array of contact objects.
 */
export function renderAllContacts(contactList) {
  let contacts = [];
  
  if (Array.isArray(contactList) && contactList.length > 0) {
    const firstElement = contactList[0];
    if (typeof firstElement === 'object' && !firstElement.userFullName) {
      contacts = Object.values(firstElement);
    } else {
      contacts = contactList;
    }
  } else {
    contacts = contactList || [];
  }

  if (!Array.isArray(contacts)) return;
  
  contacts
  .slice()
  .sort((a, b) => a.userFullName.localeCompare(b.userFullName))
  .forEach(contact => {
    if (contact && contact.userFullName) {
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
  });
}

/**
 * Renders a single contact card and its alphabet filter letter.
 *
 * @param {string} name - Full name of the contact.
 * @param {string} email - Email address.
 * @param {string} phone - Phone number.
 * @param {string} initials - Initials of the contact.
 * @param {string} firstChar - First letter of the name (used for alphabet filter).
 * @param {string|number} id - Unique ID of the contact.
 * @param {string} color - Color class of the contact.
 */
export function renderContact(name, email, phone, initials, firstChar, id, color) {
  renderAlphabetFilter(firstChar);
  const html = renderContactCard(name, email, initials, id, color, phone);
  document.getElementById("allContacts").innerHTML += html;
}

/**
 * Renders a new alphabet letter heading if not already rendered.
 *
 * @param {string} letter - First letter of a contact name.
 */
export function renderAlphabetFilter(letter) {
  if (!alphabetLettersUsedSet.has(letter)) {
    alphabetLettersUsedSet.add(letter);
    document.getElementById("allContacts").innerHTML +=
      `<div class="startLetter"><h2>${letter}</h2></div>`;
  }
}

/**
 * Generates the HTML string for a contact card.
 *
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
 */
export function clearContactListUI() {
  document.getElementById("allContacts").innerHTML = "";
  alphabetLettersUsedSet.clear();
}

/**
 * Clears the big contact detail view.
 */
export function clearBigContactView() {
  document.getElementById("bigContact").innerHTML = "";
}
