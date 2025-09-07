/**
 * @fileoverview User registration functionality with password validation and form handling.
 * Initializes signup behavior, collects user input, handles password validation, and submits feedback.
 * @version 1.0.0
 * @author Join Team
 */

import { bindPrivacyCheckbox, bindPolicyLinks, bindSignupForm } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { initInputField, confirmInputForFormValidation, showValidateBubble } from "../scripts/auth/Validation.js";

export const userPasswordInputField = document.getElementById("inputPassword");
export const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
export const privacyPolicyCheckbox = document.getElementById("checkBox");
export const signUpSubmitButton = document.getElementById("signUpBtn");

/**
 * Initializes all signup event listeners and bindings.
 */
export async function signupListeners() {
  const signupFormElement = document.getElementById("signUpForm");
  if (!signupFormElement) return;

  bindSignupForm(signupFormElement);
  togglePassword('inputPassword', "togglePasswordIcon");
  togglePassword('inputConfirmPassword', "toggleConfirmPasswordIcon");
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
  initInputField('inputName', 'nameHint', 'name');
  initInputField('inputEmail', 'emailHint', 'email');
  initInputField('inputPassword', 'pwHint', 'password');
  initInputField('inputConfirmPassword', 'pwCheckHint', 'password');

  ['inputName', 'inputEmail', 'inputPassword', 'inputConfirmPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkFormValidity);
  });

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
function togglePassword(elementId, iconId) {
  const pw = document.getElementById(elementId);
  pw.setAttribute('type', 'password');
  document.getElementById(iconId).addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
    pw.nextElementSibling.src = pw.type === 'password' ? '../assets/icons/visibility.svg' : '../assets/icons/visibility_off.svg';
  })
};

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
  const {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    passwordValue,
    passwordConfirmValue
  } = getFormValidationInputs();

  const doPasswordsMatch = checkPasswordForMatch(
    'pwCheckHint',
    passwordValue,
    passwordConfirmValue
  );

  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    doPasswordsMatch
  };
}


function getFormValidationInputs() {
  const isNameValid = confirmInputForFormValidation('inputName', 'nameHint');
  const isEmailValid = confirmInputForFormValidation('inputEmail', 'emailHint');
  const isPasswordValid = confirmInputForFormValidation('inputPassword', 'pwHint');
  const isPasswordConfirmValid = confirmInputForFormValidation('inputConfirmPassword', 'pwCheckHint');
  const isPrivacyChecked = privacyPolicyCheckbox?.checked || false;

  const passwordValue = document.getElementById('inputPassword')?.value ?? '';
  const passwordConfirmValue = document.getElementById('inputConfirmPassword')?.value ?? '';

  console.table({
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    passwordValue,
    passwordConfirmValue
  });

  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    passwordValue,
    passwordConfirmValue
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

  console.log("logstates:", state.isNameValid, state.isEmailValid, state.isPasswordValid, state.isPasswordConfirmValid, state.doPasswordsMatch, state.isPrivacyChecked);


  updateSubmitButton(isFormValid);
  return isFormValid;
}

function checkPasswordForMatch(bubbleId, passwordValue, passwordConfirmValue) {
  const passwordOk = (passwordValue?.length ?? 0) >= 6 && (passwordConfirmValue?.length ?? 0) >= 6;
  const passwordMatch = passwordOk && passwordValue === passwordConfirmValue;

  if (passwordOk) {
    // Vorher: showValidateBubble(bubbleId, message, "pwCheckHint"...)
    // Korrekt: inputId zuerst (hier das Confirm-Feld), bubbleId = "pwCheckHint"
    showValidateBubble(
      'inputConfirmPassword',
      passwordMatch ? "Password Matches" : "Looks Good, but Passwords do not match",
      "pwCheckHint",
      3000
    );
  }
  return passwordMatch;
}

