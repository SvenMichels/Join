import { bindPrivacyCheckbox, bindPolicyLinks, bindSignupForm } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { LocalStorageService } from "../scripts/utils/localStorageHelper.js";
import { initInputField, confirmInputForFormValidation, showValidateBubble, setFieldValidity, hideValidateBubble } from "../scripts/auth/Validation.js";


let signUpSubmitButton;
let privacyPolicyCheckbox;

if (window.location.pathname.endsWith("signup.html")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSignup);
  } else {
    initSignup();
  }
}

/**
 * Initializes the signup page functionality
 * @returns {void}
 */
function initSignup() {
  cacheDom();
  initFields();
  signupListeners();
  checkFormValidity();
}

/**
 * Caches DOM elements for later use
 * @returns {void}
 */
function cacheDom() {
  signUpSubmitButton = document.getElementById("signUpBtn");
  privacyPolicyCheckbox = document.getElementById("checkBox");
}

/**
 * Initializes input field validation and event listeners
 * @returns {void}
 */
function initFields() {
  initInputField("inputName", "nameHint", "name");
  initInputField("inputEmail", "emailHint", "email");
  initInputField("inputPassword", "pwHint", "password");
  initInputField("inputConfirmPassword", "pwCheckHint", "password");

  ["inputName", "inputEmail", "inputPassword", "inputConfirmPassword"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", checkFormValidity);
  });
  privacyPolicyCheckbox?.addEventListener("change", checkFormValidity);
}

/**
 * Sets up event listeners for the signup form
 * @returns {Promise<void>} Promise that resolves when listeners are bound
 */
export async function signupListeners() {
  const form = document.getElementById("signUpForm");
  if (!form) return;

  bindSignupForm(form);

  togglePassword("inputPassword", "togglePasswordIcon");
  togglePassword("inputConfirmPassword", "toggleConfirmPasswordIcon");

  bindPrivacyCheckbox();
  bindPolicyLinks();
  checkFormValidity();
}

/**
 * Toggles password visibility for a given input field
 * @param {string} inputId - ID of the password input field
 * @param {string} iconId - ID of the toggle icon element
 * @returns {void}
 */
export function togglePassword(inputId, iconId) {
  const hiddenPassword = document.getElementById(inputId);
  const toggleHiddenIcon = document.getElementById(iconId);
  if (!hiddenPassword || !toggleHiddenIcon) return;

  if (toggleHiddenIcon.dataset.toggleBound === "true") return;
  hiddenPassword.type = "password";
  toggleHiddenIcon.style.cursor = "pointer";

  toggleHiddenIcon.addEventListener("click", (e) => {
    hidePasswordType(e, hiddenPassword, toggleHiddenIcon);
  });
  toggleHiddenIcon.dataset.toggleBound = "true";
}

/**
 * Handles the actual password type toggle functionality
 * @param {Event} e - Click event
 * @param {HTMLInputElement} hiddenPassword - Password input element
 * @param {HTMLElement} toggleHiddenIcon - Toggle icon element
 * @returns {void}
 */
function hidePasswordType(e, hiddenPassword, toggleHiddenIcon) {
  e.preventDefault();
  const hidden = hiddenPassword.type === "password";
  hiddenPassword.type = hidden ? "text" : "password";
  toggleHiddenIcon.src = hidden
    ? "../assets/icons/visibility.svg"
    : "../assets/icons/visibility_off.svg";
}

/**
 * Handles form submission for user signup
 * @param {Event} event - Form submission event
 * @returns {Promise<void>} Promise that resolves when submission is complete
 */
export async function handleSignupSubmission(event) {
  event?.preventDefault();
  if (signUpSubmitButton?.disabled) return;
  if (!privacyPolicyCheckbox?.checked) return;

  const userData = await collectUserInput();
  if (!userData) return;

  await submitUser();
}

/**
 * Collects and validates user input from the form
 * @returns {Promise<Object>} Promise that resolves to user data object
 */
export async function collectUserInput() {
  const userFullName = getTrimmedInputValue("inputName");
  const userEmail = getTrimmedInputValue("inputEmail");
  const userPassword = document.getElementById("inputPassword")?.value || "";
  const userColor = generateRandomColorClass();

  return {
    userFullName,
    userEmailAddress: userEmail,
    userPassword,
    userPhoneNumber: "",
    userColor,
    userInitials: getInitials(userFullName),
    firstCharacter: getFirstCharacter(userFullName)
  };
}

/**
 * Gets trimmed value from an input element by ID
 * @param {string} id - Element ID
 * @returns {string} Trimmed input value or empty string
 */
export function getTrimmedInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

/**
 * Gets the first character of a name, capitalized
 * @param {string} name - Name to extract first character from
 * @returns {string} First character capitalized or "?" if empty
 */
export function getFirstCharacter(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

/**
 * Submits user data and shows success feedback
 * @returns {Promise<void>} Promise that resolves when submission is complete
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
  }, { once: true });
}

/**
 * Gets validation status for all form input fields
 * @returns {Object} Object containing validation states for all inputs
 */
function getFormValidationInputs() {
  const isNameValid = confirmInputForFormValidation("inputName", "nameHint");
  const isEmailValid = confirmInputForFormValidation("inputEmail", "emailHint");
  const isPasswordValid = confirmInputForFormValidation("inputPassword", "pwHint");
  const isPasswordConfirmValid = confirmInputForFormValidation("inputConfirmPassword", "pwCheckHint");
  const isPrivacyChecked = privacyPolicyCheckbox?.checked || false;
  const passwordValue = document.getElementById("inputPassword")?.value || "";
  const passwordConfirmValue = document.getElementById("inputConfirmPassword")?.value || "";
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

/**
 * Validates the entire form including password matching
 * @returns {Object} Object containing overall form validation state
 */
function getFormValidation() {
  const { isNameValid, isEmailValid, isPasswordValid, isPasswordConfirmValid, isPrivacyChecked, passwordValue, passwordConfirmValue } = getFormValidationInputs();
  const doPasswordsMatch = checkPasswordForMatch("pwCheckHint", passwordValue, passwordConfirmValue, isPrivacyChecked);
  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    doPasswordsMatch
  };
}

/**
 * Updates submit button state based on form validity
 * @param {boolean} isFormValid - Whether the form is valid
 * @returns {void}
 */
function updateSubmitButton(isFormValid) {
  if (!signUpSubmitButton) return;
  signUpSubmitButton.disabled = !isFormValid;
  signUpSubmitButton.style.backgroundColor = "#2a3647";
  signUpSubmitButton.style.opacity = isFormValid ? "1" : "0.5";
  signUpSubmitButton.style.cursor = isFormValid ? "pointer" : "not-allowed";
}

/**
 * Checks overall form validity and updates UI accordingly
 * @returns {boolean} True if form is valid, false otherwise
 */
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

/**
 * Gets password and confirmation password elements
 * @returns {Object} Object containing password elements
 */
function getPasswordElements() {
  return {
    passwordEl: document.getElementById("inputPassword"),
    confirmEl: document.getElementById("inputConfirmPassword"),
  };
}

/**
 * Handles UI when password is too short
 * @param {boolean} isPrivacyChecked - Whether privacy checkbox is checked
 * @param {string} bubbleId - ID of validation bubble
 * @param {HTMLElement} confirmEl - Password confirmation element
 * @returns {boolean} Always returns false
 */
function handleTooShort(isPrivacyChecked, bubbleId, confirmEl) {
  setFieldValidity("inputConfirmPassword", false);
  if (!isPrivacyChecked && confirmEl) {
    setFieldClass(confirmEl, false);
  } else {
    hideValidateBubble(bubbleId);
  }
  return false;
}

/**
 * Applies UI changes when privacy checkbox is checked
 * @param {HTMLElement} passwordEl - Password input element
 * @param {HTMLElement} confirmEl - Password confirmation element
 * @param {boolean} match - Whether passwords match
 * @param {string} bubbleId - ID of validation bubble
 * @returns {boolean} Whether passwords match
 */
function applyPrivacyCheckedUI(passwordEl, confirmEl, match, bubbleId) {
  hideValidateBubble(bubbleId);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, match);
  return match;
}

/**
 * Shows UI feedback when passwords match
 * @param {HTMLElement} passwordEl - Password input element
 * @param {HTMLElement} confirmEl - Password confirmation element
 * @param {string} bubbleId - ID of validation bubble
 * @returns {void}
 */
function showMatchFlow(passwordEl, confirmEl, bubbleId) {
  showValidateBubble("inputConfirmPassword", "Password Matches", bubbleId, 3000);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, true);
}

/**
 * Shows UI feedback when passwords don't match
 * @param {HTMLElement} passwordEl - Password input element
 * @param {HTMLElement} confirmEl - Password confirmation element
 * @param {string} bubbleId - ID of validation bubble
 * @returns {void}
 */
function showMismatchFlow(passwordEl, confirmEl, bubbleId) {
  showValidateBubble("inputConfirmPassword", "Passwords do not match", bubbleId, 3000);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, false);
}

/**
 * Checks if passwords match and updates UI accordingly
 * @param {string} bubbleId - ID of validation bubble
 * @param {string} passwordValue - Password value
 * @param {string} passwordConfirmValue - Password confirmation value
 * @param {boolean} isPrivacyChecked - Whether privacy checkbox is checked
 * @returns {boolean} Whether passwords match
 */
function checkPasswordForMatch(bubbleId, passwordValue, passwordConfirmValue, isPrivacyChecked) {
  const { passwordEl, confirmEl } = getPasswordElements();
  const okLength = passwordValue.length >= 6 && passwordConfirmValue.length >= 6;
  if (!okLength) {
    return handleTooShort(isPrivacyChecked, bubbleId, confirmEl);
  }
  const match = passwordValue === passwordConfirmValue;
  setFieldValidity("inputConfirmPassword", match);
  if (isPrivacyChecked) {
    return applyPrivacyCheckedUI(passwordEl, confirmEl, match, bubbleId);
  }
  if (match) {
    showMatchFlow(passwordEl, confirmEl, bubbleId);
  } else {
    showMismatchFlow(passwordEl, confirmEl, bubbleId);
  }
  return match;
}

/**
 * Sets CSS classes for field validation styling
 * @param {HTMLElement} el - Element to style
 * @param {boolean} isValid - Whether field is valid
 * @returns {void}
 */
function setFieldClass(el, isValid) {
  if (!el) return;
  el.classList.toggle("validate-border-blue", !!isValid);
  el.classList.toggle("validate-border-red", !isValid);
}