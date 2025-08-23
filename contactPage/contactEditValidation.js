/**
 * @fileoverview Validation for the Contact Edit modal.
 * Validates name, email and phone inputs, shows feedback, and blocks form submit on errors.
 */

import { showValidationError, hideValidationError } from "../signup/signup.js";
import { isValidEmail } from "../scripts/events/loginevents.js";

const formElement = document.getElementById("editContactForm");
const nameInput = document.getElementById("editContactName");
const emailInput = document.getElementById("editContactEmail");
const phoneInput = document.getElementById("editContactPhone");
const nameFeedbackElement = document.getElementById("editModalNameFeedback");
const emailFeedbackElement = document.getElementById("editModalEmailFeedback");
const phoneFeedbackElement = document.getElementById("editModalPhoneFeedback");

/**
 * Hides an error message in the provided feedback element.
 *
 * @param {HTMLElement|null} feedbackElement - Target element to clear.
 * @returns {void}
 */
function hideError(feedbackElement) {
    if (feedbackElement) hideValidationError(feedbackElement);
}

/**
 * Shows an error message in the provided feedback element.
 *
 * @param {HTMLElement|null} feedbackElement - Target element to write the message to.
 * @param {string} message - Error message to display.
 * @returns {void}
 */
function showError(feedbackElement, message) {
    if (feedbackElement) showValidationError(feedbackElement, message);
}

/**
 * Validates the name input.
 * - Must not be empty.
 * - Must not start with a space.
 * - Letters plus optional spaces/'/ - separators only (Unicode letters supported).
 *
 * @param {HTMLInputElement|null} inputElement - Name input element.
 * @param {HTMLElement|null} feedbackElement - Feedback target element.
 * @returns {boolean} True if valid.
 */
function validateName(inputElement, feedbackElement) {
    if (!inputElement || !feedbackElement) return false;
    const rawValue = inputElement.value ?? "";

    if (!rawValue.trim()) { hideError(feedbackElement); return false; }
    if (/^\s/.test(rawValue)) { showError(feedbackElement, "Name must not begin with a space."); return false; }

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
 * Validates the email input.
 * - Must not be empty.
 * - Must not start with or contain spaces.
 * - Must match isValidEmail.
 *
 * @param {HTMLInputElement|null} inputElement - Email input element.
 * @param {HTMLElement|null} feedbackElement - Feedback target element.
 * @returns {boolean} True if valid.
 */
function validateEmail(inputElement, feedbackElement) {
    if (!inputElement || !feedbackElement) return false;
    const rawValue = inputElement.value ?? "";

    if (!rawValue.trim()) { hideError(feedbackElement); return false; }
    if (/^\s/.test(rawValue)) { showError(feedbackElement, "Email must not begin with a space."); return false; }
    if (/\s/.test(rawValue)) { showError(feedbackElement, "Email must not contain spaces."); return false; }
    if (!isValidEmail(rawValue)) {
        showError(feedbackElement, "Please enter a valid email address.");
        return false;
    }
    hideError(feedbackElement);
    return true;
}

/**
 * Validates the phone input.
 * - Digits only after cleaning (+, spaces, (), -, . allowed in UI).
 * - 7–15 digits required.
 *
 * @param {HTMLInputElement|null} inputElement - Phone input element.
 * @param {HTMLElement|null} feedbackElement - Feedback target element.
 * @returns {boolean} True if valid.
 */
function validatePhone(inputElement, feedbackElement) {
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
 * Validates all three fields and updates feedback elements.
 *
 * @returns {boolean} True if all fields are valid.
 */
function validateAllFields() {
    const isNameValid = validateName(nameInput, nameFeedbackElement);
    const isEmailValid = validateEmail(emailInput, emailFeedbackElement);
    const isPhoneValid = validatePhone(phoneInput, phoneFeedbackElement);
    return isNameValid && isEmailValid && isPhoneValid;
}

let isValidationBound = false;

/**
 * Initializes validation for the Contact Edit modal.
 * - Binds input listeners once.
 * - Adds a submit guard to block saving while invalid.
 * - Performs an initial validation pass.
 *
 * @returns {void}
 */
export function initContactEditValidation() {
    if (!formElement || !nameInput || !emailInput || !phoneInput) return;
    if (isValidationBound) { validateAllFields(); return; }

    nameInput.addEventListener("input", () => validateName(nameInput, nameFeedbackElement));
    emailInput.addEventListener("input", () => validateEmail(emailInput, emailFeedbackElement));
    phoneInput.addEventListener("input", () => validatePhone(phoneInput, phoneFeedbackElement));

    formElement.addEventListener("submit", (event) => {
        if (!validateAllFields()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    isValidationBound = true;
    validateAllFields();
}
