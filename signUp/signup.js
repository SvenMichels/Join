/**
 * @fileoverview User registration functionality with password validation and form handling.
 * Initializes signup behavior, collects user input, handles password validation, and submits feedback.
 * @version 1.0.0
 * @author Join Team
 */

import { bindPrivacyCheckbox, bindPolicyLinks, bindSignupForm } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { validatePasswordInput, validatePasswords, validateEmailInput, validateNameInput } from "./signupvalidate.js";

export const userPasswordInputField = document.getElementById("inputPassword");
export const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
export const privacyPolicyCheckbox = document.getElementById("checkBox");
export const signUpSubmitButton = document.getElementById("signUpBtn");
export const passwordToggleIcon = document.querySelector("#inputPassword + .toggle-password");
export const confirmToggleIcon = document.querySelector("#inputConfirmPassword + .toggle-password");

/**
 * Initializes all signup event listeners and bindings.
 */
export async function signupListeners() {
  const signupFormElement = document.getElementById("signUpForm");
  if (!signupFormElement) return;

  bindSignupForm(signupFormElement);
  bindPrivacyCheckbox();
  bindPolicyLinks();
  setupInputValidation();
  checkFormValidity();
}

/**
 * Initializes signup page when loaded.
 */
if (window.location.pathname.endsWith("signup.html")) {
  signupListeners();
  setupPasswordEvents();
  signUpSubmitButton.addEventListener("click", handleSignupSubmission);
}

/**
 * Sets up password field event listeners for validation and toggle functionality.
 */
export function setupPasswordEvents() {
  userPasswordInputField.addEventListener("input", validatePasswords);
  confirmPasswordInputField.addEventListener("input", validatePasswords);

  passwordToggleIcon.addEventListener("click", () =>
    togglePassword(userPasswordInputField, passwordToggleIcon)
  );
  confirmToggleIcon.addEventListener("click", () =>
    togglePassword(confirmPasswordInputField, confirmToggleIcon)
  );
}

/**
 * Initializes validation for all input fields.
 */
export function setupInputValidation() {
  setupNameValidation();
  setupEmailValidation();
  setupPasswordValidation();
  setupPrivacyCheckboxValidation();
}

/**
 * Sets up name input validation and keypress prevention.
 */
export function setupNameValidation() {
  const nameInput = document.querySelector("#inputName");
  if (!nameInput) return;

  nameInput.addEventListener("input", (event) => validateNameInput(event.target));
  nameInput.addEventListener("keypress", (event) => preventInvalidNameInput(event));
}

/**
 * Sets up email input validation and keypress prevention.
 */
export function setupEmailValidation() {
  const emailInput = document.querySelector("#inputEmail");
  if (!emailInput) return;

  emailInput.addEventListener("input", (event) => validateEmailInput(event.target));
  emailInput.addEventListener("keypress", (event) => preventInvalidEmailInput(event));
}

/**
 * Sets up password input validation and keypress prevention.
 */
export function setupPasswordValidation() {
  const passwordInput = document.querySelector("#inputPassword");
  if (!passwordInput) return;

  passwordInput.addEventListener("input", (event) => validatePasswordInput(event.target));
  passwordInput.addEventListener("keypress", (event) => preventInvalidPasswordInput(event));
}

/**
 * Sets up privacy checkbox change event listener.
 */
export function setupPrivacyCheckboxValidation() {
  if (privacyPolicyCheckbox) {
    privacyPolicyCheckbox.addEventListener("change", checkFormValidity);
  }
}

/**
 * Prevents invalid characters from being entered in name field.
 * @param {KeyboardEvent} event - The keypress event
 */
export function preventInvalidNameInput(event) {
  const char = event.key;
  const currentValue = event.target.value;

  if (char === " " && currentValue.length === 0) {
    event.preventDefault();
    return;
  }

  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  const isLetter = /[a-zA-ZäöüÄÖÜß]/.test(char);
  const isSpace = char === " ";

  if (!isLetter && !isSpace && !allowedKeys.includes(char)) {
    event.preventDefault();
  }
}

/**
 * Prevents invalid characters from being entered in email field.
 * @param {KeyboardEvent} event - The keypress event
 */
export function preventInvalidEmailInput(event) {
  const char = event.key;
  const currentValue = event.target.value;

  if (char === " ") {
    event.preventDefault();
    return;
  }

  if (currentValue.length === 0 && !/[a-zA-Z0-9]/.test(char)) {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!allowedKeys.includes(char)) {
      event.preventDefault();
    }
  }
}

/**
 * Prevents invalid characters from being entered in password field.
 * @param {KeyboardEvent} event - The keypress event
 */
export function preventInvalidPasswordInput(event) {
  const char = event.key;
  const currentValue = event.target.value;

  if (char === " " && currentValue.length === 0) {
    event.preventDefault();
  }
}

/**
 * Displays validation error message for a field.
 * @param {HTMLElement} errorDiv - The error display element
 * @param {string} message - The error message to display
 */
export function showValidationError(errorDiv, message) {
  if (!errorDiv) return;

  errorDiv.textContent = message;
  errorDiv.style.color = "red";
}

/**
 * Hides validation error message for a field.
 * @param {HTMLElement} errorDiv - The error display element
 */
export function hideValidationError(errorDiv) {
  if (!errorDiv) return;
  errorDiv.textContent = "";         // Fehlertext leeren
  errorDiv.style.color = "white";
}

/**
 * Toggles password visibility for a field.
 * @param {HTMLInputElement} field - The password input field
 * @param {HTMLElement} icon - The toggle icon element
 */
export function togglePassword(field, icon) {
  const isHidden = field.type === "password";
  field.type = isHidden ? "text" : "password";
  icon.src = isHidden ? "../assets/icons/visibility_off.svg" : "../assets/icons/visibility.svg";
}

/**
 * Handles signup form submission.
 * @param {Event} event - The click event
 */
export async function handleSignupSubmission(event) {
  event?.preventDefault();
  if (signUpSubmitButton?.disabled) return;
  if (!privacyPolicyCheckbox.checked) return;

  const userData = await collectUserInput();
  if (!userData) return;

  await submitUser();
}

/**
 * Collects and validates user input from the signup form.
 * @returns {Object|null} User data object or null if validation fails
 */
export async function collectUserInput() {
  const userFullName = getTrimmedInputValue("inputName");
  const userEmailAddress = getTrimmedInputValue("inputEmail");
  const userPassword = userPasswordInputField.value;
  const userColor = generateRandomColorClass();

  return {
    userFullName,
    userEmailAddress,
    userPassword,
    userPhoneNumber: "",
    userColor,
    userInitials: getInitials(userFullName),
    firstCharachter: getFirstCharacter(userFullName)
  };
}

/**
 * Gets trimmed value from input field by ID.
 * @param {string} id - The input element ID
 * @returns {string} Trimmed input value
 */
export function getTrimmedInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

/**
 * Gets first character of name in uppercase.
 * @param {string} name - The user's name
 * @returns {string} First character or "?" if empty
 */
export function getFirstCharacter(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

/**
 * Submits user registration and displays feedback animation.
 */
export async function submitUser() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("dp-none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("dp-none");
      feedback.classList.remove("centerFeedback");
      window.location.href = "../index.html";
    }, 1500);
  });
}

/**
 * Checks overall form validity and enables/disables submit button.
 */
export function checkFormValidity() {
  const isNameValid = isFieldValid("inputName", "nameValidationError");
  const isEmailValid = isFieldValid("inputEmail", "emailValidationError");
  const isPasswordValid = isPasswordFieldValid();
  const isPrivacyChecked = privacyPolicyCheckbox?.checked || false;

  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isPrivacyChecked;

  if (signUpSubmitButton) {
    console.log(signUpSubmitButton);
    
    signUpSubmitButton.disabled = !isFormValid;
    signUpSubmitButton.style.backgroundColor = isFormValid ? "#2a3647" : "#2a3647";
    signUpSubmitButton.style.opacity = isFormValid ? "1" : "0.5";
    signUpSubmitButton.style.cursor = isFormValid ? "pointer" : "not-allowed";
  }
}

/**
 * Checks if a specific input field is valid.
 * @param {string} inputId - The input element ID
 * @param {string} errorId - The error element ID
 * @returns {boolean} True if field is valid
 */
export function isFieldValid(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);

  if (!input || !input.value.trim()) return false;
  // Prüfe auf vorhandenen Fehlertext statt display
  if (errorEl && errorEl.textContent && errorEl.textContent.trim().length > 0) return false;

  return true;
}

/**
 * Checks if password fields are valid and match.
 * @returns {boolean} True if password fields are valid
 */
export function isPasswordFieldValid() {
  const password = userPasswordInputField?.value;
  const confirmPassword = confirmPasswordInputField?.value;
  const errorEl = document.getElementById("passwordValidationError");

  if (!password || !confirmPassword) return false;
  if (password.length < 6) return false;
  if (password !== confirmPassword) return false;
  // Prüfe auf Fehlermeldungstext
  if (errorEl && errorEl.textContent && errorEl.textContent.trim().length > 0) return false;

  return true;
}
