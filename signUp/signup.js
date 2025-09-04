/**
 * @fileoverview User registration functionality with password validation and form handling.
 * Initializes signup behavior, collects user input, handles password validation, and submits feedback.
 * @version 1.0.0
 * @author Join Team
 */

import { bindPrivacyCheckbox, bindPolicyLinks, bindSignupForm } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { initEmailField, initPasswordField, initNameField, confirmInputForFormValidation, showValidateBubble, hideValidateBubble } from "../scripts/auth/Validation.js";

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
  checkFormValidity();
}
loadAllFormInits();
/**
 * Initializes signup page when loaded.
 */
if (window.location.pathname.endsWith("signup.html")) {
  signupListeners();
}

function loadAllFormInits() {
  initNameField('inputName', 'nameHint');
  initEmailField('inputEmail', 'emailHint');
  initPasswordField('inputPassword', 'pwHint');
  initPasswordField('inputConfirmPassword', 'pwCheckHint');

  ['inputName', 'inputEmail', 'inputPassword', 'inputConfirmPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkFormValidity);
  });

  // Privacy-Checkbox überwachen
  if (privacyPolicyCheckbox) {
    privacyPolicyCheckbox.addEventListener('change', checkFormValidity);
  }
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
function getFormValidation() {
  const isNameValid = confirmInputForFormValidation('inputName', 'nameHint');
  const isEmailValid = confirmInputForFormValidation('inputEmail', 'emailHint');
  const isPasswordValid = confirmInputForFormValidation('inputPassword', 'pwHint');
  const isPasswordConfirmValid = confirmInputForFormValidation('inputConfirmPassword', 'pwCheckHint');
  const isPrivacyChecked = privacyPolicyCheckbox?.checked || false;

  const passwordValue = document.getElementById('inputPassword')?.value;
  const passwordConfirmValue = document.getElementById('inputConfirmPassword')?.value;
  let doPasswordsMatch = false;
  let shownPasswordMatch = true;

  checkPasswordForMatch(shownPasswordMatch, passwordValue, passwordConfirmValue, isPasswordValid);
  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    doPasswordsMatch
  };
}

function updateSubmitButton(isFormValid) {
  if (!signUpSubmitButton) return;
  signUpSubmitButton.disabled = !isFormValid;
  signUpSubmitButton.style.backgroundColor = "#2a3647";
  signUpSubmitButton.style.opacity = isFormValid ? "1" : "0.5";
  signUpSubmitButton.style.cursor = isFormValid ? "pointer" : "not-allowed";
}

export function checkFormValidity() {
  const state = getFormValidation();
  const isFormValid =
    state.isNameValid &&
    state.isEmailValid &&
    state.isPasswordValid &&
    state.isPasswordConfirmValid &&
    state.doPasswordsMatch &&
    state.isPrivacyChecked;

  updateSubmitButton(isFormValid);
  return isFormValid;
}

function checkPasswordForMatch(shownPasswordMatch, passwordValue, passwordConfirmValue, isPasswordValid) {
  const passwordOk = passwordValue.length >= 6 && passwordConfirmValue.length >= 6;
  const doPasswordsMatch = passwordValue === passwordConfirmValue;

  if (passwordOk && doPasswordsMatch && !shownPasswordMatch) {
    showValidateBubble("", "Password Matches", "pwCheckHint", 3000);
    shownPasswordMatch = true;
  } else if (passwordOk && isPasswordValid && !doPasswordsMatch) {
    showValidateBubble("", "Looks Good, but Passwords do not match", "pwCheckHint", 3000);
    shownPasswordMatch = false;
  }
}

