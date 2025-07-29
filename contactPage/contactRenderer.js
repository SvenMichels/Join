/**
 * Kontakte anzeigen
 */

let alphabetLettersUsedSet = new Set();

/**
 * Alle Kontakte rendern
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
  
  contacts.forEach(contact => {
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
 * Einzelnen Kontakt rendern
 */
export function renderContact(name, email, phone, initials, firstChar, id, color) {
  renderAlphabetFilter(firstChar);
  const html = renderContactCard(name, email, initials, id, color, phone);
  document.getElementById("allContacts").innerHTML += html;
}

/**
 * Buchstabe für Alphabet-Filter
 */
export function renderAlphabetFilter(letter) {
  if (!alphabetLettersUsedSet.has(letter)) {
    alphabetLettersUsedSet.add(letter);
    document.getElementById("allContacts").innerHTML +=
      `<div class="startLetter"><h2>${letter}</h2></div>`;
  }
}

/**
 * HTML für Kontakt-Karte
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
 * Liste leeren
 */
export function clearContactListUI() {
  document.getElementById("allContacts").innerHTML = "";
  alphabetLettersUsedSet.clear();
}

/**
 * Kontaktansicht leeren
 */
export function clearBigContactView() {
  document.getElementById("bigContact").innerHTML = "";
}
