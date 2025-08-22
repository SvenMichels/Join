import { hideValidationError, showValidationError, checkFormValidity, userPasswordInputField, confirmPasswordInputField } from "./signup.js";
import { isValidEmail } from "../scripts/events/loginevents.js"

/**
 * Helper to handle validation result.
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
 * Validates name input field for correct format and characters.
 */
export function validateNameInput(input) {
    const value = input.value.trimEnd();
    const errorEl = document.getElementById("nameValidationError");
    if (!value) return setValidation(true, errorEl);
    if (input.value.startsWith(" "))
        return setValidation(false, errorEl, "Name darf nicht mit einem Leerzeichen beginnen");
    const onlyLettersAndSpaces = /^[a-zA-ZäöüÄÖÜß\s]+$/;
    if (!onlyLettersAndSpaces.test(value))
        return setValidation(false, errorEl, "Name darf nur Buchstaben und Leerzeichen enthalten");
    setValidation(true, errorEl);
}

/**
 * Validates email input field for correct format.
 */
export function validateEmailInput(input) {
    const email = input.value;
    const errorEl = document.getElementById("emailValidationError");
    if (!email) return setValidation(true, errorEl);
    if (email.startsWith(" "))
        return setValidation(false, errorEl, "E-Mail darf nicht mit einem Leerzeichen beginnen");
    if (email.includes(" "))
        return setValidation(false, errorEl, "E-Mail darf keine Leerzeichen enthalten");
    if (!isValidEmail(email))
        return setValidation(false, errorEl, "Ungültige E-Mail-Adresse");
    setValidation(true, errorEl);
}

/**
 * Validates that password and confirm password fields match.
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
    setValidation(false, errorEl, "Passwörter stimmen nicht überein");
}

/**
 * Validates password input for minimum length and format.
 */
export function validatePasswordInput(input) {
    const password = input.value;
    const errorEl = document.getElementById("passwordValidationError");
    if (!password) return setValidation(true, errorEl);
    if (password.startsWith(" "))
        return setValidation(false, errorEl, "Passwort darf nicht mit einem Leerzeichen beginnen");
    if (password.length < 6)
        return setValidation(false, errorEl, "Passwort muss mindestens 6 Zeichen lang sein");
    setValidation(true, errorEl);
    setTimeout(validatePasswords, 250);
}