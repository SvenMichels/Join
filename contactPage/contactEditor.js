/**
 * Edit contact functionality
 */

import { getInitials } from '../scripts/utils/helpers.js';
import { updateContact } from './contactDataService.js';
import { setupDeleteButton } from '../contactPage/contactsMain.js';
import { formValidation } from '../contactPage/contactsMain.js';
import { showValidateBubble, confirmInputForFormValidation, initInputField, setFieldValidity, checkBubbleContext } from '../scripts/auth/Validation.js';
import { enableButton, disableButton } from '../scripts/events/loginevents.js';

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

export async function handleContactEditSubmission(e) {
  e.preventDefault();
  const contact = editingContact;
  const updated = getEditContactInput(contact);
  if (!updated) return;

  const nameValid = confirmInputForFormValidation('editContactName', 'editNameHint');
  const emailValid = confirmInputForFormValidation('editContactEmail', 'editEmailHint');
  if (!nameValid) {
    showValidateBubble('editContactName', 'Name invalid or too short.', 'editNameHint', 2000);
  }
  if (!emailValid) {
    showValidateBubble('editContactEmail', 'Email invalid.', 'editEmailHint', 2000);
  }
  if (!nameValid || !emailValid) return;

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
    initInputField('editContactName', 'editNameHint', 'name');
    initInputField('editContactEmail', 'editEmailHint', 'email');
    setupEditValidationAndButton();
  }
}

function setUserInitials(contact) {
  const contactInitials = document.getElementById("editInitials");
  contactInitials.textContent = contact.userInitials || getInitials(contact.userFullName);
  contactInitials.classList.add("editInitials", `${contact.userColor}`);
}

function setupEditValidationAndButton() {
  const nameInput = document.getElementById('editContactName');
  const emailInput = document.getElementById('editContactEmail');
  const saveBtn = document.getElementById('editSubmitBtn');
  const nameOk = confirmInputForFormValidation('editContactName', 'editNameHint');
  const emailOk = confirmInputForFormValidation('editContactEmail', 'editEmailHint');
  if (nameOk && emailOk) {
    enableButton(saveBtn);
    setFieldValidity('editContactName', true);
    setFieldValidity('editContactEmail', true);
  } else {
    disableButton(saveBtn);
    setFieldValidity('editContactName', false);
    setFieldValidity('editContactEmail', false);
  }
  if (!nameInput || !emailInput || !saveBtn) return;

  function updateState() {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();

    if (nameVal.length > 0 && nameVal.length < 4) {
      showValidateBubble('editContactName', 'Use at least 4 characters.', 'editNameHint', 1800);
    }
    if (emailVal.length > 0 && emailVal.length < 6) {
      showValidateBubble('editContactEmail', 'Use at least 6 characters.', 'editEmailHint', 1800);
    }
    if (nameVal.length === 0 && emailVal.length === 0) {
      showValidateBubble('editContactName', 'Name is required.', 'editNameHint', 1800);
      showValidateBubble('editContactEmail', 'Email is required.', 'editEmailHint', 1800);
    }

    const nameOk = confirmInputForFormValidation('editContactName', 'editNameHint');
    const emailOk = confirmInputForFormValidation('editContactEmail', 'editEmailHint');

    if (nameOk && emailOk) {
      enableButton(saveBtn);
    } else {
      disableButton(saveBtn);
    }
  }
  nameInput.addEventListener('input', updateState);
  emailInput.addEventListener('input', updateState);

  updateState();

  return { updateState };
}