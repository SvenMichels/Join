/**
 * @fileoverview User registration functionality with password validation and form handling
 * @author Join Team
 * @version 1.0.0
 */

import { signupListeners } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";

const userPasswordInputField = document.getElementById("inputPassword");
const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
const privacyPolicyCheckbox = document.getElementById("checkBox");
const signUpSubmitButton = document.getElementById("signUpBtn");
const passwordToggleIcon = document.querySelector("#inputPassword + .toggle-password");
const confirmToggleIcon = document.querySelector("#inputConfirmPassword + .toggle-password");

/**
 * Initialisiert Signup-Seite wenn geladen
 */
if (window.location.pathname.endsWith("signup.html")) {
  signupListeners();
  
  // Password validation setup
  userPasswordInputField.addEventListener("input", validatePasswords);
  confirmPasswordInputField.addEventListener("input", validatePasswords);
  
  // Password visibility toggles
  passwordToggleIcon.addEventListener("click", () => 
    togglePassword(userPasswordInputField, passwordToggleIcon)
  );
  confirmToggleIcon.addEventListener("click", () => 
    togglePassword(confirmPasswordInputField, confirmToggleIcon)
  );
  
  signUpSubmitButton.addEventListener("click", handleSignupSubmission);
}

/**
 * Validiert Passwort-Übereinstimmung
 */
function validatePasswords() {
  const match = userPasswordInputField.value === confirmPasswordInputField.value;
  confirmPasswordInputField.setCustomValidity(match ? "" : "Passwords do not match");
}

/**
 * Schaltet Passwort-Sichtbarkeit um
 * @param {HTMLInputElement} field - Passwort-Feld
 * @param {HTMLElement} icon - Toggle-Icon
 */
function togglePassword(field, icon) {
  const isHidden = field.type === "password";
  field.type = isHidden ? "text" : "password";
  icon.src = isHidden ? "../assets/icons/visibility_off.svg" : "../assets/icons/visibility.svg";
}

/**
 * Behandelt Signup-Formular-Übermittlung
 * @param {Event} event - Click-Event
 */
async function handleSignupSubmission(event) {
  if (!privacyPolicyCheckbox.checked) return;

  const userData = await collectUserInput();
  if (!userData) return;

  await submitUser();
}

/**
 * Sammelt und validiert Benutzereingaben
 * @returns {Object|null} Benutzerdaten oder null bei Fehler
 * @exports
 */
export async function collectUserInput() {
  const userFullName = document.getElementById("inputName").value.trim();
  const userEmailAddress = document.getElementById("inputEmail").value.trim();
  const userPassword = userPasswordInputField.value;
  const userColor = generateRandomColorClass();
  
  const userInitials = getInitials(userFullName);
  const firstCharacter = userFullName ? userFullName.charAt(0).toUpperCase() : "?";

  return { 
    userFullName, 
    userEmailAddress, 
    userPassword, 
    userPhoneNumber: "", 
    userColor,
    userInitials,
    firstCharacter
  };
}

/**
 * Übermittelt Benutzerregistrierung und zeigt Feedback
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
