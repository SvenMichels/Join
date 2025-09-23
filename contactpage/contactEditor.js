/**
 * Edit contact functionality
 */

import { getInitials } from '../scripts/utils/helpers.js';
import { updateContact } from './contactDataService.js';
import { setupDeleteButton } from './contactsMain.js';
import { formValidation } from './contactsMain.js';
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
// --- helpers ---
function safeTrim(value) {
  return typeof value === "string" ? value.trim() : value;
}

function resolveName(userFullName) {
  if (typeof userFullName === "string") return userFullName.trim();
  const inputVal = document.getElementById("editContactName")?.value ?? "";
  return inputVal.toString().trim();
}

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


function validateEditInputs() {
  const nameValid = confirmInputForFormValidation("editContactName", "editNameHint");
  const emailValid = confirmInputForFormValidation("editContactEmail", "editEmailHint");

  if (!nameValid) {
    showValidateBubble("editContactName", "Name invalid or too short.", "editNameHint", 2000);
  }
  if (!emailValid) {
    showValidateBubble("editContactEmail", "Email invalid.", "editEmailHint", 2000);
  }

  return { nameValid, emailValid };
}

function normalizeAndEnrichContact(updated, contact) {
  const name =
    (updated.userFullName ?? "").toString().trim() ||
    (contact?.userFullName ?? "");

  updated.userFullName = name;
  updated.userInitials = getInitials(name);
  updated.firstCharacter = (name.charAt(0) || "?").toUpperCase();

  return updated;
}

async function persistContactUpdate(contact, updated) {
  await updateContact(contact, updated);
}

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

function setUserInitials(contact) {
  const contactInitials = document.getElementById("editInitials");
  contactInitials.textContent = contact.userInitials || getInitials(contact.userFullName);
  contactInitials.classList.remove(...Array.from(contactInitials.classList).filter(c => c.startsWith('color-')));
  contactInitials.classList.add("editInitials", `${contact.userColor}`);
}

function getEditEls() {
  return {
    nameInput: document.getElementById("editContactName"),
    emailInput: document.getElementById("editContactEmail"),
    saveBtn: document.getElementById("editSubmitBtn"),
  };
}

function computeValidity() {
  const nameOk = confirmInputForFormValidation("editContactName", "editNameHint");
  const emailOk = confirmInputForFormValidation("editContactEmail", "editEmailHint");
  return { nameOk, emailOk };
}

function applyInitialValidity(saveBtn, { nameOk, emailOk }) {

  if (nameOk && emailOk) {
    console.log("initial valid", nameOk, emailOk);
    enableButton(saveBtn);
    setFieldValidity("editContactName", true);
    setFieldValidity("editContactEmail", true);
  } else {
    console.log("initial invalid", nameOk, emailOk);
    disableButton(saveBtn);
    setFieldValidity("editContactName", false);
    setFieldValidity("editContactEmail", false);
  }
}

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

function makeUpdateState(nameInput, emailInput, saveBtn) {
  return function updateState() {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();

    showLengthAndRequiredHints(nameVal, emailVal);

    const { nameOk, emailOk } = computeValidity();
    console.log("validity", { nameOk, emailOk });
    if (nameOk && emailOk) {
      enableButton(saveBtn);
    } else {
      disableButton(saveBtn);
    }
  };
}

function setupEditValidationAndButton() {
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
