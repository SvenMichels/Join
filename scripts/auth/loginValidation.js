/**
 * @fileoverview Validation helpers for the login form.
 * Validates email and password fields and shows error messages.
 */

import { hideValidationError, showValidationError } from "../../signup/signup.js";
import { isValidEmail } from "../events/loginevents.js";

/**
 * Applies validation result by showing or hiding the error.
 * Does not toggle button state; that is handled in loginevents.js.
 *
 * @param {boolean} isValid
 * @param {HTMLElement|null} errorEl
 * @param {string} [message=""]
 */
function setLoginValidation(isValid, errorEl, message = "") {
  if (!errorEl) return;
  if (isValid) {
    hideValidationError(errorEl);
  } else {
    showValidationError(errorEl, message);
  }
}

/**
 * Validates the login email input.
 * - Not empty (no message when empty).
 * - Must not begin with a space.
 * - Must not contain spaces.
 * - Must match isValidEmail.
 *
 * @param {HTMLInputElement|null} input - Email input element.
 */
export function validateLoginEmailInput(input) {
  if (!input) return;

  const errorEl = document.getElementById("loginEmailValidationError");
  const email = input.value || "";

  if (!email) return setLoginValidation(true, errorEl);
  if (email.replace(/\s/g, "").length === 0)
    return setLoginValidation(false, errorEl, "Email must not begin with a space.");
  if (email.startsWith(" "))
    return setLoginValidation(false, errorEl, "Email must not begin with a space.");
  if (email.includes(" "))
    return setLoginValidation(false, errorEl, "Email must not contain spaces");
  if (!isValidEmail(email))
    return setLoginValidation(false, errorEl, "Invalid email address");

  setLoginValidation(true, errorEl);
}

/**
 * Validates the login password input.
 * - Not empty (no message when empty).
 * - Must not begin with a space.
 * - Minimum length of 3 (compatible with guest password "123").
 *
 * @param {HTMLInputElement|null} input - Password input element.
 */
export function validateLoginPasswordInput(input) {
  if (!input) return;
  const errorEl = document.getElementById("loginPasswordValidationError");
  const pwd = input.value || "";

  if (!pwd) return setLoginValidation(true, errorEl);
  if (pwd.startsWith(" "))
    return setLoginValidation(false, errorEl, "Password must not begin with a space.");
  if (pwd.length < 6)
    return setLoginValidation(false, errorEl, "Password must be at least 6 characters long");

  setLoginValidation(true, errorEl);
}