/**
 * Edit contact functionality
 */

import { getInitials } from '../scripts/utils/helpers.js';
import { updateContact } from './contactDataService.js';
import { setupDeleteButton } from './contactsMain.js';
import { formValidation } from './contactsMain.js';
import { showValidateBubble, confirmInputForFormValidation, initInputField, setFieldValidity, checkBubbleContext, isFieldValid } from '../scripts/auth/Validation.js';
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
// --- helpers ---
/**
 * Safely trims string values or returns original value if not a string.
 * @param {*} value - Value to trim.
 * @returns {*} Trimmed string or original value.
 */
function safeTrim(value) {
  return typeof value === "string" ? value.trim() : value;
}

/**
 * Resolves and validates the full name from input or contact object.
 * @param {string} userFullName - Full name from form input.
 * @returns {string} Trimmed and validated full name.
 */
function resolveName(userFullName) {
  if (typeof userFullName === "string") return userFullName.trim();
  const inputVal = document.getElementById("editContactName")?.value ?? "";
  return inputVal.toString().trim();
}

/**
 * Builds updated user object for editing with sanitized values.
 * @param {Object} contact - Original contact object.
 * @param {Object} updates - Object containing updated field values.
 * @param {string} updates.userFullName - Updated full name.
 * @param {string} updates.userEmailAddress - Updated email address.
 * @param {string} updates.userPhoneNumber - Updated phone number.
 * @returns {Object} Updated contact object.
 */
function buildUserForEdit(contact, { userFullName, userEmailAddress, userPhoneNumber }) {
  return {
    userFullName: resolveName(userFullName),
    userEmailAddress: safeTrim(userEmailAddress),
    userPhoneNumber: safeTrim(userPhoneNumber),
    userPassword: contact.userPassword,
  };
}

export function getEditContactInput(contact) {
  const result = formValidation(contact, "editContactEmail", "editContactPhone");
  if (!result) return null;

  return buildUserForEdit(contact, result);
}


/**
 * Validates edit form inputs and shows validation messages.
 * @returns {Object} Object containing validation results for name and email.
 * @returns {boolean} returns.nameValid - Whether name field is valid.
 * @returns {boolean} returns.emailValid - Whether email field is valid.
 */
function validateEditInputs() {
  const nameValid = document.getElementById("editContactName").reportValidity();
  const emailValid = document.getElementById("editContactEmail").reportValidity();
  console.log(`validateEditInputs: nameValid=${nameValid}, emailValid=${emailValid}`);

  if (!nameValid) {
    showValidateBubble("editContactName", "Name invalid or too short.", "editNameHint", 2000);
  }
  if (!emailValid) {
    showValidateBubble("editContactEmail", "Email invalid.", "editEmailHint", 2000);
  }

  return { nameValid, emailValid };
}

/**
 * Normalizes contact data and enriches it with computed properties.
 * @param {Object} updated - Updated contact data.
 * @param {Object} contact - Original contact object for fallback values.
 * @returns {Object} Enriched contact object with initials and first character.
 */
function normalizeAndEnrichContact(updated, contact) {
  const name =
    (updated.userFullName ?? "").toString().trim() ||
    (contact?.userFullName ?? "");

  updated.userFullName = name;
  updated.userInitials = getInitials(name);
  updated.firstCharacter = (name.charAt(0) || "?").toUpperCase();

  return updated;
}

/**
 * Persists the contact update to the data store.
 * @param {Object} contact - Original contact object.
 * @param {Object} updated - Updated contact data.
 * @returns {Promise<void>}
 */
async function persistContactUpdate(contact, updated) {
  await updateContact(contact, updated);
}

/**
 * Handles the submission of the contact edit form.
 * 
 * @param {Event} e - Submit event
 */
export async function handleContactEditSubmission(e) {
  e.preventDefault();

  const contact = editingContact;
  const updated = getEditContactInput(contact);
  if (!updated) return;

  const { nameValid, emailValid } = validateEditInputs();
  if (!nameValid || !emailValid) return;

  const enriched = normalizeAndEnrichContact(updated, contact);
  await persistContactUpdate(contact, enriched);
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
    setupEditValidationAndButton();
    initInputField('editContactName', 'editNameHint', 'name');
    initInputField('editContactEmail', 'editEmailHint', 'email');
  }
}

/**
 * Sets user initials and color styling for the edit dialog.
 * @param {Object} contact - Contact object containing user data and styling info.
 */
function setUserInitials(contact) {
  const contactInitials = document.getElementById("editInitials");
  contactInitials.textContent = contact.userInitials || getInitials(contact.userFullName);
  contactInitials.classList.remove(...Array.from(contactInitials.classList).filter(c => c.startsWith('color-')));
  contactInitials.classList.add("editInitials", `${contact.userColor}`);
}

/**
 * Gets DOM element references for the edit form.
 * @returns {Object} Object containing form element references.
 * @returns {HTMLInputElement} returns.nameInput - Name input element.
 * @returns {HTMLInputElement} returns.emailInput - Email input element.
 * @returns {HTMLButtonElement} returns.saveBtn - Save button element.
 */
function getEditEls() {
  return {
    nameInput: document.getElementById("editContactName"),
    emailInput: document.getElementById("editContactEmail"),
    saveBtn: document.getElementById("editSubmitBtn"),
  };
}

/**
 * Computes validity state of form fields.
 * @returns {Object} Object containing validity flags.
 * @returns {boolean} returns.nameOk - Whether name field is valid.
 * @returns {boolean} returns.emailOk - Whether email field is valid.
 */
function computeValidity() {
  const nameOk = confirmInputForFormValidation("editContactName", "editNameHint");
  const emailOk = confirmInputForFormValidation("editContactEmail", "editEmailHint");
  return { nameOk, emailOk };
}

/**
 * Applies initial validity state to the save button and form fields.
 * @param {HTMLButtonElement} saveBtn - Save button element.
 * @param {Object} validity - Object containing validity flags.
 * @param {boolean} validity.nameOk - Whether name field is valid.
 * @param {boolean} validity.emailOk - Whether email field is valid.
 */
function applyInitialValidity(saveBtn, { nameOk, emailOk }) {

  if (nameOk && emailOk) {
    enableButton(saveBtn);
    setFieldValidity("editContactName", true);
    setFieldValidity("editContactEmail", true);
  } else {
    disableButton(saveBtn);
    setFieldValidity("editContactName", false);
    setFieldValidity("editContactEmail", false);
  }
}

/**
 * Shows validation hints for field length and required field validation.
 * @param {string} nameVal - Current name input value.
 * @param {string} emailVal - Current email input value.
 */
function showLengthAndRequiredHints(nameVal, emailVal) {
  if (nameVal.length > 0 && nameVal.length < 4) {
    showValidateBubble("editContactName", "Use at least 4 characters.", "editNameHint", 1800);
  }
  if (emailVal.length > 0 && emailVal.length < 6) {
    showValidateBubble("editContactEmail", "Use at least 6 characters.", "editEmailHint", 1800);
  }
  if (nameVal.length === 0 && emailVal.length === 0) {
    showValidateBubble("editContactName", "Name is required.", "editNameHint", 1800);
    showValidateBubble("editContactEmail", "Email is required.", "editEmailHint", 1800);
  }
}

/**
 * Creates a state update function for form validation and button management.
 * @param {HTMLInputElement} nameInput - Name input element.
 * @param {HTMLInputElement} emailInput - Email input element.
 * @param {HTMLButtonElement} saveBtn - Save button element.
 * @returns {Function} Update state function to be called on input changes.
 */
function makeUpdateState(nameInput, emailInput, saveBtn) {
  return function updateState() {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();

    showLengthAndRequiredHints(nameVal, emailVal);

    const { nameOk, emailOk } = computeValidity();
    if (nameOk && emailOk) {
      enableButton(saveBtn);
    } else {
      disableButton(saveBtn);
    }
  };
}

/**
 * Sets up validation and button state management for the edit form.
 * @returns {Object|undefined} Object containing the update state function, or undefined if elements not found.
 * @returns {Function} returns.updateState - Function to update validation state.
 */
export function setupEditValidationAndButton() {
  const { nameInput, emailInput, saveBtn } = getEditEls();
  if (!nameInput || !emailInput || !saveBtn) return;
  if (nameInput.value.trim().length > 3) {
    setFieldValidity("editContactName", true);
  }
  if (emailInput.value.trim().length > 4) {
    setFieldValidity("editContactEmail", true);
  }
  const { nameOk, emailOk } = computeValidity();
  applyInitialValidity(saveBtn, { nameOk, emailOk });
  const updateState = makeUpdateState(nameInput, emailInput, saveBtn);
  nameInput.addEventListener("input", updateState);
  emailInput.addEventListener("input", updateState);
  updateState();
  return { updateState };
}
