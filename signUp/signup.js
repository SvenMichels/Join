/**
 * @fileoverview User registration functionality with password validation and form handling.
 * Initializes signup behavior, collects user input, handles password validation, and submits feedback.
 * @version 1.0.0
 * @author Join Team
 */

import { signupListeners, isValidEmail } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";

const userPasswordInputField = document.getElementById("inputPassword");
const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
const privacyPolicyCheckbox = document.getElementById("checkBox");
const signUpSubmitButton = document.getElementById("signUpBtn");
const passwordToggleIcon = document.querySelector("#inputPassword + .toggle-password");
const confirmToggleIcon = document.querySelector("#inputConfirmPassword + .toggle-password");

/**
 * Initializes signup page when loaded.
 */
if (window.location.pathname.endsWith("signup.html")) {
  signupListeners();

  userPasswordInputField.addEventListener("input", validatePasswords);
  confirmPasswordInputField.addEventListener("input", validatePasswords);

  passwordToggleIcon.addEventListener("click", () =>
    togglePassword(userPasswordInputField, passwordToggleIcon)
  );
  confirmToggleIcon.addEventListener("click", () =>
    togglePassword(confirmPasswordInputField, confirmToggleIcon)
  );

  signUpSubmitButton.addEventListener("click", handleSignupSubmission);
}

/**
 * Validates whether both password fields match.
 */
function validatePasswords() {
  const match = userPasswordInputField.value === confirmPasswordInputField.value;
  confirmPasswordInputField.setCustomValidity(match ? "" : "Passwords do not match");
  isValidEmail(match)
}

/**
 * Toggles visibility of the password input.
 *
 * @param {HTMLInputElement} field - Password input field.
 * @param {HTMLElement} icon - Icon used to toggle visibility.
 */
function togglePassword(field, icon) {
  const isHidden = field.type === "password";
  field.type = isHidden ? "text" : "password";
  icon.src = isHidden ? "../assets/icons/visibility_off.svg" : "../assets/icons/visibility.svg";
}

/**
 * Handles signup form submission.
 *
 * @param {Event} event - Click event.
 */
async function handleSignupSubmission(event) {
  if (!privacyPolicyCheckbox.checked) return;

  const userData = await collectUserInput();
  if (!userData) return;

  await submitUser();
}

/**
 * Collects and validates user input from the signup form.
 *
 * @returns {Object|null} Collected user data object or null on failure.
 * @exports
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

function getTrimmedInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

function getFirstCharacter(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

/**
 * Submits the user registration and displays feedback animation.
 */
async function submitUser() {
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
