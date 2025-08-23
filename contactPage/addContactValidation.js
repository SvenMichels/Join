/**
 * @fileoverview Validation for the Add Contact modal.
 * Validates name, email and phone inputs, shows feedback, and blocks form submit on errors.
 */

import { showValidationError, hideValidationError } from "../signup/signup.js";
import { isValidEmail } from "../scripts/events/loginevents.js";

/**
 * Form and input element references used for validation.
 * @type {HTMLFormElement|null}
 */
const formElement = document.getElementById("addContactForm");
/** @type {HTMLInputElement|null} */
const nameInput = document.getElementById("contactName");
/** @type {HTMLInputElement|null} */
const emailInput = document.getElementById("contactEmail");
/** @type {HTMLInputElement|null} */
const phoneInput = document.getElementById("contactPhone");
/** @type {HTMLElement|null} */
const nameFeedbackElement = document.getElementById("addContactNameFeedback");
/** @type {HTMLElement|null} */
const emailFeedbackElement = document.getElementById("addContactEmailFeedback");
/** @type {HTMLElement|null} */
const phoneFeedbackElement = document.getElementById("addContactPhoneFeedback");

/**
 * Hides an error message in the provided feedback element.
 *
 * @param {HTMLElement|null} feedbackElement - Element to clear the message from.
 * @returns {void}
 */
function hideError(feedbackElement) {
    if (feedbackElement) hideValidationError(feedbackElement);
}

/**
 * Shows an error message in the provided feedback element.
 *
 * @param {HTMLElement|null} feedbackElement - Element to write the message to.
 * @param {string} message - Error message to display.
 * @returns {void}
 */
function showError(feedbackElement, message) {
    if (feedbackElement) showValidationError(feedbackElement, message);
}

/**
 * Validates the "Name" input.
 * - Must not be empty.
 * - Must not begin with a space.
 * - Letters plus optional spaces/'/- separators only (Unicode letters supported).
 *
 * @param {HTMLInputElement|null} inputElement - Name input element.
 * @param {HTMLElement|null} feedbackElement - Target element for error feedback.
 * @returns {boolean} True if valid.
 */
function validateAddName(inputElement, feedbackElement) {
    if (!inputElement || !feedbackElement) return false;

    const rawValue = inputElement.value ?? "";
    if (!rawValue.trim()) { hideError(feedbackElement); return false; }
    if (/^\s/.test(rawValue)) {
        showError(feedbackElement, "Name must not begin with a space.");
        return false;
    }
    const normalizedValue = rawValue.normalize("NFC");
    const namePattern = /^\p{L}+(?:[ '\-]\p{L}+)*$/u;
    if (!namePattern.test(normalizedValue)) {
        showError(feedbackElement, "Name may contain letters, spaces, ' and - only.");
        return false;
    }

    hideError(feedbackElement);
    return true;
}

/**
 * Validates the "Email" input.
 * - Must not be empty.
 * - Must not begin with or contain spaces.
 * - Must match isValidEmail().
 *
 * @param {HTMLInputElement|null} inputElement - Email input element.
 * @param {HTMLElement|null} feedbackElement - Target element for error feedback.
 * @returns {boolean} True if valid.
 */
function validateAddEmail(inputElement, feedbackElement) {
    if (!inputElement || !feedbackElement) return false;

    const rawValue = inputElement.value ?? "";
    if (!rawValue.trim()) { hideError(feedbackElement); return false; }
    if (/^\s/.test(rawValue)) {
        showError(feedbackElement, "Email must not begin with a space."); return false;
    }
    if (/\s/.test(rawValue)) {
        showError(feedbackElement, "Email must not contain spaces."); return false;
    }
    if (!isValidEmail(rawValue)) {
        showError(feedbackElement, "Please enter a valid email address."); return false;
    }

    hideError(feedbackElement);
    return true;
}

/**
 * Validates the "Phone" input.
 * - Digits only (strict). Any non-digit will fail.
 *
 * @param {HTMLInputElement|null} inputElement - Phone input element.
 * @param {HTMLElement|null} feedbackElement - Target element for error feedback.
 * @returns {boolean} True if valid.
 */
function validateAddPhone(inputElement, feedbackElement) {
    if (!inputElement || !feedbackElement) return false;

    const rawValue = (inputElement.value ?? "").trim();
    if (!rawValue) { hideError(feedbackElement); return false; }

    const cleanedValue = rawValue.replace(/[()\s.-]/g, "").replace(/^\+/, "");
    if (!/^\d+$/.test(cleanedValue)) {
        showError(feedbackElement, "Phone may contain digits, +, spaces, (), - and .");
        return false;
    }

    const digitCount = cleanedValue.length;
    if (digitCount < 7 || digitCount > 15) {
        showError(feedbackElement, "Phone should have 7–15 digits.");
        return false;
    }

    hideError(feedbackElement);
    return true;
}

/**
 * Runs validation for all fields and updates feedback elements.
 *
 * @returns {boolean} True if all fields are valid.
 */
function validateAllAddFields() {
    const isNameValid = validateAddName(nameInput, nameFeedbackElement);
    const isEmailValid = validateAddEmail(emailInput, emailFeedbackElement);
    const isPhoneValid = validateAddPhone(phoneInput, phoneFeedbackElement);
    return isNameValid && isEmailValid && isPhoneValid;
}

let isValidationBound = false;

/**
 * Initializes validation for the Add Contact modal.
 * - Binds input listeners (only once).
 * - Adds a submit guard to block saving while invalid.
 * - Performs an initial validation pass.
 *
 * @returns {void}
 */
export function initAddContactValidation() {
    if (!formElement || !nameInput || !emailInput || !phoneInput) return;
    if (isValidationBound) { validateAllAddFields(); return; }

    nameInput.addEventListener("input", () => validateAddName(nameInput, nameFeedbackElement));
    emailInput.addEventListener("input", () => validateAddEmail(emailInput, emailFeedbackElement));
    phoneInput.addEventListener("input", () => validateAddPhone(phoneInput, phoneFeedbackElement));

    formElement.addEventListener("submit", (event) => {
        if (!validateAllAddFields()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    isValidationBound = true;
    validateAllAddFields();
}