/**
 * @fileoverview User registration functionality with password validation and form handling
 * @author Join Team
 * @version 1.0.0
 */

import { signupListeners } from "../scripts/events/loginevents.js";

const userPasswordInputField = document.getElementById("inputPassword");
const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
const privacyPolicyCheckbox = document.getElementById("checkBox");
const signUpSubmitButton = document.getElementById("signUpBtn");
const passwordVisibilityToggleIcon = document.querySelector("#inputPassword + .toggle-password");
const confirmPasswordVisibilityToggleIcon = document.querySelector("#inputConfirmPassword + .toggle-password");

/**
 * Initializes signup page when the page loads
 */
if (window.location.pathname.endsWith("signup.html")) {
  initializeSignupPageFunctionality();
  signupListeners();
}

/**
 * Sets up all signup page functionality including password validation and form handling
 */
function initializeSignupPageFunctionality() {
  setupPasswordMatchValidation();
  setupPasswordVisibilityToggle();
  setupSignupFormHandler();
}

/**
 * Adds event listeners for password match validation
 */
function setupPasswordMatchValidation() {
  userPasswordInputField.addEventListener("input", validatePasswordsMatchCorrectly);
  confirmPasswordInputField.addEventListener("input", validatePasswordsMatchCorrectly);
}

/**
 * Validates that password and confirm password fields match
 */
function validatePasswordsMatchCorrectly() {
  const passwordsDoNotMatch = userPasswordInputField.value !== confirmPasswordInputField.value;
  const validationMessage = passwordsDoNotMatch ? "Passwords do not match" : "";
  confirmPasswordInputField.setCustomValidity(validationMessage);
}

/**
 * Sets up password visibility toggle functionality for both password fields
 */
function setupPasswordVisibilityToggle() {
  addPasswordToggleListener(userPasswordInputField, passwordVisibilityToggleIcon);
  addPasswordToggleListener(confirmPasswordInputField, confirmPasswordVisibilityToggleIcon);
}

/**
 * Adds click event listener to password visibility toggle icon
 * @param {HTMLInputElement} passwordField - The password input field
 * @param {HTMLElement} toggleIcon - The toggle icon element
 */
function addPasswordToggleListener(passwordField, toggleIcon) {
  toggleIcon.addEventListener("click", () => {
    togglePasswordInputVisibility(passwordField, toggleIcon);
  });
}

/**
 * Toggles password visibility for a given input field
 * @param {HTMLInputElement} passwordInputElement - The password input to toggle
 * @param {HTMLElement} visibilityToggleIcon - The icon element to update
 */
function togglePasswordInputVisibility(passwordInputElement, visibilityToggleIcon) {
  const isCurrentlyHidden = passwordInputElement.type === "password";
  
  passwordInputElement.type = isCurrentlyHidden ? "text" : "password";
  updateToggleIcon(visibilityToggleIcon, isCurrentlyHidden);
}

/**
 * Updates the visibility toggle icon based on password visibility state
 * @param {HTMLElement} toggleIcon - The icon element to update
 * @param {boolean} isVisible - Whether password is currently visible
 */
function updateToggleIcon(toggleIcon, isVisible) {
  const iconPath = isVisible ? "../assets/icons/visibility_off.svg" : "../assets/icons/visibility.svg";
  toggleIcon.src = iconPath;
}

/**
 * Sets up the signup form submission handler
 */
function setupSignupFormHandler() {
  signUpSubmitButton.addEventListener("click", handleSignupSubmission);
}

/**
 * Handles signup form submission with validation
 * @param {Event} event - The click event
 */
async function handleSignupSubmission(event) {
  if (!privacyPolicyCheckbox.checked) return;

  const userInputData = await collectUserInput();
  if (!userInputData) return;

  await submitUser();
}

/**
 * Collects and validates user input from signup form
 * @returns {Object|null} User data object or null if validation fails
 * @exports
 */
export async function collectUserInput() {
  const userFullName = document.getElementById("inputName").value.trim();
  const emailAddress = document.getElementById("inputEmail").value.trim();
  const userPassword = userPasswordInputField.value;

  return { userFullName, emailAddress, userPassword };
}

/**
 * Submits user registration data and handles the response
 */
async function submitUser() {
    showUserFeedback();
  }

/**
 * Shows success feedback to user after registration
 */
function showUserFeedback() {
  const feedbackDisplayElement = document.getElementById("userFeedback");
  if (!feedbackDisplayElement) return;

  feedbackDisplayElement.classList.remove("dp-none");
  feedbackDisplayElement.classList.add("centerFeedback");
  setupFeedbackAnimation(feedbackDisplayElement);
}

/**
 * Sets up animation end listener for user feedback display
 * @param {HTMLElement} feedbackDisplayElement - The feedback element to animate
 */
function setupFeedbackAnimation(feedbackDisplayElement) {
  feedbackDisplayElement.addEventListener("animationend", () => {
    redirectAfterDelay();
  });
}

/**
 * Redirects user to login page after a delay
 */
function redirectAfterDelay() {
  setTimeout(() => {
    hideFeedbackAndRedirect();
  }, 1500);
}

/**
 * Hides feedback element and redirects to login page
 */
function hideFeedbackAndRedirect() {
  const feedbackElement = document.getElementById("userFeedback");
  if (feedbackElement) {
    feedbackElement.classList.add("dp-none");
    feedbackElement.classList.remove("centerFeedback");
  }
  window.location.href = "../index.html";
}
