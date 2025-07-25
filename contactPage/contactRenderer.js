/**
 * Kontakt-Rendering und UI-Management
 */

/**
 * Rendert alle Kontakte
 * @param {Array} list - Liste der Kontakte
 */
function renderAllContacts(list) {
  list.forEach(contact => {
    renderContact(
      contact.userFullName,
      contact.userEmailAddress,
      contact.userPhoneNumber,
      contact.userInitials,
      contact.firstCharacter,
      contact.userId,
      contact.userColor
    );
  });
}

/**
 * Rendert einzelnen Kontakt
 * @param {string} name - Name
 * @param {string} email - E-Mail
 * @param {string} phone - Telefon
 * @param {string} initials - Initialen
 * @param {string} firstChar - Erster Buchstabe
 * @param {string} id - User ID
 * @param {string} color - Farbe
 */
function renderContact(name, email, phone, initials, firstChar, id, color) {
  renderAlphabetFilter(firstChar);
  const html = renderContactCard(name, email, initials, id, color);
  document.getElementById("allContacts").innerHTML += html;
}

/**
 * Rendert Alphabet-Filter
 * @param {string} letter - Buchstabe
 */
function renderAlphabetFilter(letter) {
  if (!alphabetLettersUsedSet.has(letter)) {
    alphabetLettersUsedSet.add(letter);
    document.getElementById("allContacts").innerHTML += 
      `<div class="letterbox"><h2>${letter}</h2></div>`;
  }
}

/**
 * Rendert Kontakt-Karte
 * @param {string} name - Name
 * @param {string} email - E-Mail
 * @param {string} initials - Initialen
 * @param {string} id - User ID
 * @param {string} color - Farbe
 * @returns {string} HTML Template
 */
function renderContactCard(name, email, initials, id, color) {
  return `
    <div class="contact" onclick="renderSingleContact('${name}', '${email}', '${id}', '${initials}', '${id}', '${color}')">
      <div class="contact-icon ${color}">
        <span>${initials}</span>
      </div>
      <div class="contact-text">
        <span class="name">${name}</span>
        <span class="mail">${email}</span>
      </div>
    </div>`;
}

/**
 * Leert Kontaktliste UI
 */
function clearContactListUI() {
  document.getElementById("allContacts").innerHTML = "";
  alphabetLettersUsedSet.clear();
}

/**
 * Leert große Kontakt-Ansicht
 */
function clearBigContactView() {
  document.getElementById("bigContact").innerHTML = "";
}
