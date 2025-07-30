/**
 * Generates the HTML template for displaying a single contact in detailed view.
 *
 * @function singleContact
 * @param {string} fullContactName - The full name of the contact.
 * @param {string} emailAddress - The contact's email address.
 * @param {string} phoneNumber - The contact's phone number.
 * @param {string} contactInitials - The initials of the contact.
 * @param {string|number} contactId - The contact's unique identifier.
 * @param {string} contactColorClass - The CSS class for the contact's color.
 * @returns {string} The HTML string for the single contact view.
 */
export function singleContact(fullContactName, emailAddress, phoneNumber, contactInitials, contactId, contactColorClass) {
  return `
<div id="bigContactCard">
  <div class="closeSingleMobile" id="closeSingleMobile">
    <img src="../assets/icons/arrow-left-line.svg" alt="">
  </div>
  <div class="profileHeader">
    <div class="profilePic ${contactColorClass}">${contactInitials}</div>
    <div class="nameBtns">
      <p id="profileName" class="profileName">${fullContactName}</p>
      <div class="btns">
        <p id="edit" class="editBtn" data-id="${contactId}">
          <img src="../assets/icons/edit.svg" alt="" />Edit
        </p>
        <p id="delete" class="deleteBtn" data-id="${contactId}">
          <img src="../assets/icons/delete.svg" alt="" />Delete
        </p>
      </div>
    </div>
  </div>
  <div class="infoContainer">
    <p class="information">Contact Information</p>
    <div class="mailPhone">
      <div class="emailContainer">
        <p class="email">Email</p>
        <p id="eMail" class="emailAdress">${emailAddress}</p>
      </div>
      <div class="numberContainer">
        <p class="phone">Phone</p>
        <p class="phoneNumber">${phoneNumber}</p>
      </div>
    </div>
  </div>
</div>
<div class="fab-container" id="fabContainer">
  <button class="fab-btn" id="fabToggle">⋮</button>
  <div class="fab-menu" id="fabMenu">
    <p class="fab-menu-item" id="fabEdit" data-id="${contactId}">
      <img src="../assets/icons/edit.svg" alt="" /> Edit
    </p>
    <p class="fab-menu-item" id="fabDelete" data-id="${contactId}">
      <img src="../assets/icons/delete.svg" alt="" /> Delete
    </p>
  </div>
</div>
`;
}

/**
 * Generates the HTML element for a single alphabet letter separator in the contact list.
 *
 * @function alphabetfilter
 * @param {string} alphabetLetter - The alphabet letter to render.
 * @returns {string} HTML string for the alphabet filter section.
 */
export function alphabetfilter(alphabetLetter) {
  return `
    <div class="startLetter">${alphabetLetter}</div>
    <div class="stripe"></div>`;
}

/**
 * Generates the HTML for a contact list entry (small contact card).
 *
 * @function contactCard
 * @param {string} fullContactName - Full name of the contact.
 * @param {string} emailAddress - Email address of the contact.
 * @param {string} contactInitials - Initials for the contact.
 * @param {string|number} contactId - Unique contact identifier.
 * @param {string} contactColorClass - CSS class for contact’s color styling.
 * @returns {string} HTML string representing the contact card.
 */
export function contactCard(fullContactName, emailAddress, contactInitials, contactId, contactColorClass) {
  return `
    <div class="contact" data-id="${contactId}">
      <div class="pic ${contactColorClass}">${contactInitials}</div>
      <div class="nameAdressContainer">
        <div id="profileName" class="contactName">${fullContactName}</div>
        <div class="email">${emailAddress}</div>
      </div>
    </div>`;
}
