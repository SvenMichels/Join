/**
 * Edit contact functionality
 */

import { getInitials } from '../scripts/utils/helpers.js';
import { updateContact } from './contactDataService.js';
import { setupDeleteButton } from '../contactPage/contactsMain.js';
import { formValidation } from '../contactPage/contactsMain.js';

let editingContact = null;

/**
 * Fills the form fields with contact data.
 * 
 * @param {Object} contact - Contact object to populate the form with
 */
export function fillEditForm(contact) {
  document.getElementById("editContactName").value = contact.userFullName || "";
  document.getElementById("editContactEmail").value = contact.userEmailAddress || "";
  document.getElementById("editContactPhone").value = contact.userPhoneNumber || "";
}

/**
 * Retrieves edited values from the form.
 * 
 * @returns {Object} Form input values (name, email, phone)
 */
export function getEditContactInput(contact) {
  const result = formValidation(contact, "editContactEmail", "editContactPhone");
  if (!result) {
    return null;
  }

  const { userEmailAddress, userPhoneNumber, userFullName } = result;

  const name =
    typeof userFullName === 'string'
      ? userFullName.trim()
      : (document.getElementById("editContactName")?.value ?? '').toString().trim();

  const userForEdit = {
    userFullName: name,
    userEmailAddress: typeof userEmailAddress === 'string' ? userEmailAddress.trim() : userEmailAddress,
    userPhoneNumber: typeof userPhoneNumber === 'string' ? userPhoneNumber.trim() : userPhoneNumber,
    userPassword: contact.userPassword
  };
  return userForEdit;
}
// ...existing code...

export async function handleContactEditSubmission(e) {
  e.preventDefault();
  const contact = editingContact;
  const updated = getEditContactInput(contact);
  if (!updated) return;
  const name = (updated.userFullName ?? '').toString().trim() || (contact?.userFullName ?? '');
  updated.userFullName = name;
  updated.userInitials = getInitials(name);
  updated.firstCharacter = (name.charAt(0) || '?').toUpperCase();

  await updateContact(contact, updated);
}

/**
 * Clears all relevant input fields.
 */
export function emptyInput() {
  const fields = ["contactName", "contactEmail", "contactPhone", "editContactName", "editContactEmail", "editContactPhone"];
  fields.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
}

/**
 * Opens the contact edit dialog and sets the current editing contact.
 * 
 * @param {Object} contact - Contact to be edited
 */
export function openEditDialog(contact) {
  editingContact = contact;
  const editWindow = document.getElementById("editWindow");
  if (editWindow) {
    editWindow.classList.remove("dp-none");
    fillEditForm(contact);
    setupDeleteButton(contact);
    setUserInitials(contact);
  }
}

function setUserInitials(contact) {
  const contactInitials = document.getElementById("editInitials");
  contactInitials.textContent = contact.userInitials || getInitials(contact.userFullName);
  contactInitials.classList.add("editInitials", `${contact.userColor}`);
}
