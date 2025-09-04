/**
 * @fileoverview Validation for the Contact Edit modal.
 * Validates name, email and phone inputs, shows feedback, and blocks form submit on errors.
 */

import { isValidEmail } from "../scripts/events/loginevents.js";

const formElement = document.getElementById("editContactForm");
const nameInput = document.getElementById("editContactName");
const emailInput = document.getElementById("editContactEmail");
const phoneInput = document.getElementById("editContactPhone");
const nameFeedbackElement = document.getElementById("editModalNameFeedback");
const emailFeedbackElement = document.getElementById("editModalEmailFeedback");
const phoneFeedbackElement = document.getElementById("editModalPhoneFeedback");

/**
 * Validates all three fields and updates feedback elements.
 *
 * @returns {boolean} True if all fields are valid.
 */
function validateAllFields() {
    const isNameValid = validateName(nameInput, nameFeedbackElement);
    const isEmailValid = validateEmail(emailInput, emailFeedbackElement);
    const isPhoneValid = validatePhone(phoneInput, phoneFeedbackElement);
    return isNameValid && isEmailValid && isPhoneValid;
}

let isValidationBound = false;
