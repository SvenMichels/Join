/**
 * @fileoverview Validation helpers for the signup form.
 * Provides per-field validation and a small dispatcher to show/hide errors.
 */

import { hideValidationError, showValidationError, checkFormValidity, userPasswordInputField, confirmPasswordInputField } from "./signup.js";
import { isValidEmail } from "../scripts/events/loginevents.js"

/**
 * Applies validation result by showing or hiding the error and re-checking form validity.
 *
 * @param {boolean} isValid - Whether the field is valid.
 * @param {HTMLElement|null} errorEl - The element to show/hide the error text.
 * @param {string} [message=""] - Error message to display when invalid.
 * @returns {void}
 */
function setValidation(isValid, errorEl, message = "") {
    if (isValid) {
        hideValidationError(errorEl);
    } else {
        showValidationError(errorEl, message);
    }
    checkFormValidity();
}

/**
 * Validates the name input.
 * - Must not start with a space.
 * - Letters and spaces only (supports umlauts).
 *
 * @param {HTMLInputElement} input - Name input element.
 * @returns {void}
 */
export function validateNameInput(input) {
    const value = input.value.trimEnd();
    const errorEl = document.getElementById("nameValidationError");
    if (!value) return setValidation(true, errorEl);
    if (input.value.startsWith(" "))
        return setValidation(false, errorEl, "Name must not begin with a space.");
    const onlyLettersAndSpaces = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    if (!onlyLettersAndSpaces.test(value))
        return setValidation(false, errorEl, "Name may only contain letters and spaces");
    setValidation(true, errorEl);
}

/**
 * Validates the email input.
 * - Must not start with a space.
 * - Must not contain spaces.
 * - Must match isValidEmail.
 *
 * @param {HTMLInputElement} input - Email input element.
 * @returns {void}
 */
export function validateEmailInput(input) {
    const email = input.value;
    const errorEl = document.getElementById("emailValidationError");
    if (!email) return setValidation(true, errorEl);
    if (email.startsWith(" "))
        return setValidation(false, errorEl, "Email must not begin with a space.");
    if (email.includes(" "))
        return setValidation(false, errorEl, "Email must not contain spaces");
    if (!isValidEmail(email))
        return setValidation(false, errorEl, "Ungültige E-Mail-Adresse");
    setValidation(true, errorEl);
}

/**
 * Validates that password and confirm password match.
 * Sets a custom validity message on the confirm field.
 *
 * @returns {void}
 */
export function validatePasswords() {
    const password = userPasswordInputField.value;
    const confirmPassword = confirmPasswordInputField.value;
    const errorEl = document.getElementById("passwordValidationError");
    if (!password || !confirmPassword) {
        confirmPasswordInputField.setCustomValidity("");
        return setValidation(true, errorEl);
    }
    if (password === confirmPassword) {
        confirmPasswordInputField.setCustomValidity("");
        return setValidation(true, errorEl);
    }
    confirmPasswordInputField.setCustomValidity("Passwords do not match");
    setValidation(false, errorEl, "Passwords do not match");
}

/**
 * Validates password format.
 * - Must not start with a space.
 * - Must be at least 6 characters long.
 * Triggers cross-field validation with a short delay.
 *
 * @param {HTMLInputElement} input - Password input element.
 * @returns {void}
 */
export function validatePasswordInput(input) {
    const password = input.value;
    const errorEl = document.getElementById("passwordValidationError");
    if (!password) return setValidation(true, errorEl);
    if (password.startsWith(" "))
        return setValidation(false, errorEl, "Password must not begin with a space.");
    if (password.length < 6)
        return setValidation(false, errorEl, "Password must be at least 6 characters long");
    setValidation(true, errorEl);
    setTimeout(validatePasswords, 250);
}