/**
 * @fileoverview Central input validation and validation bubbles.
 * Supports email, password, name, phone, subtask text, and date validation.
 * Contains initializers for input fields including live feedback.
 * @module Validation
 */

/**
 * Function type for validation messages.
 * @callback ValidationMessageFn
 * @param {string} userInput - Raw value from the input field
 * @returns {string} Validation message (empty or "Looks good!" on success)
 */

/**
 * Imports pure message generators for validation.
 * Each function corresponds to the type {@link ValidationMessageFn}.
 * Source/Implementation: ./validationsmessages.js
 * - getEmailMessage(userInput): string
 * - getPasswordMessage(userInput): string
 * - getNameMessage(userInput): string
 * - getPhoneMessage(userInput): string
 * - getSubtaskMessage(userInput): string
 * - getDateMessage(userInput): string
 * @see ./validationsmessages.js
 */
import { getEmailMessage, getPasswordMessage, getNameMessage, getPhoneMessage, getSubtaskMessage, getDateMessage } from "./validationsmessages.js";

/**
 * Internal storage of field validity per input ID.
 * @type {Record<string, boolean>}
 */
const fieldValidityState = Object.create(null);

initInputField('loginEmail', 'emailHint', 'email');
initInputField('loginPassword', 'pwHint', 'password');

/**
 * Initializes an input field with validation and validation bubble.
 * @description Binds input/focus/blur handlers and sets initial state
 * @param {string} inputId - ID of the input element
 * @param {string} bubbleId - ID of the bubble element for messages
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType - Type of validation
 * @returns {void}
 */
export function initInputField(inputId, bubbleId, inputType) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const allowInnerSpaces = inputType === 'name';
  const subtaskAllowed = inputType === 'subtask';
  const phoneMode = inputType === 'phone';
  const dateMode = inputType === 'date';
  const discriptionMode = inputType === 'description';

  validateInput(input, bubbleId, { allowInnerSpaces, subtaskAllowed, phoneMode, dateMode, discriptionMode });
  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => inputEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('focus', (e) => focusEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('blur', () => { inputTrimmer(input); hideValidateBubble(bubbleId); });
}

/**
 * Trims leading and trailing whitespace from the current input value.
 * @description Removes whitespace from input field value if present
 * @param {HTMLInputElement} input - The input field
 * @returns {void}
 * @private
 */
function inputTrimmer(input) {
  const trimmed = input.value.replace(/^\s+|\s+$/g, '');
  if (trimmed !== input.value) {
    input.value = trimmed;
  }
}

/**
 * Focus handler: shows context-based validation message.
 * @description Handles special case "Confirm Password" and displays validation feedback
 * @param {string} inputId - ID of the input element
 * @param {string} bubbleId - ID of the bubble element
 * @param {Event} e - Focus event
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType - Type of validation
 * @returns {void}
 */
export function focusEventlistener(inputId, bubbleId, e, inputType) {
  if (inputId === 'inputConfirmPassword') {
    const { passwordInput, currentValue, matchedValues } = getListenerConfig(e);
    if (matchedValues && passwordInput !== currentValue) {
      showValidateBubble(inputId, 'Password okay, but do not match', bubbleId, 2000);
      setFieldValidity(inputId, false);
      return;
    }
    if (matchedValues && passwordInput === currentValue) {
      showValidateBubble(inputId, 'Password Matches', bubbleId, 2000);
      setFieldValidity(inputId, true);
      return;
    }
  }
  const msg = getMessage(inputType, inputId, bubbleId, e);
  showValidateBubble(inputId, msg, bubbleId, 2000);
}

/**
 * Returns a validation message based on input type.
 * @description Generates appropriate validation message for the specified input type
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType - Type of validation
 * @param {string} inputId - ID of the input element
 * @param {string} bubbleId - ID of the bubble element
 * @param {Event} e - Input event
 * @returns {string} Message text
 * @private
 */
function getMessage(inputType, inputId, bubbleId, e) {
  let msg = '';
  if (inputType === 'subtask') msg = getSubtaskMessage(e.target.value);
  if (inputType === 'email') msg = getEmailMessage(e.target.value);
  if (inputType === 'password') msg = getPasswordMessage(e.target.value);
  if (inputType === 'name') msg = getNameMessage(e.target.value);
  if (inputType === 'phone') msg = getPhoneMessage(e.target.value);
  if (inputType === 'date') msg = getDateMessage(e.target.value);
  if (msg === '') hideValidateBubble(inputId + bubbleId);
  return msg;
}

/**
 * Reads comparison values for password/confirmation from the DOM.
 * @description Extracts password and confirmation values for comparison validation
 * @param {Event} e - Input event
 * @returns {{ passwordInput: string, currentValue: string, matchedValues: boolean }} Comparison data
 * @private
 */
function getListenerConfig(e) {
  const passwordInput = document.getElementById('inputPassword')?.value || '';
  const currentValue = e.target.value;
  const matchedValues = passwordInput.length >= 6 && currentValue.length >= 6;
  return { passwordInput, currentValue, matchedValues };
}

/**
 * Input handler: live validate and update bubble.
 * @description Handles special case "Confirm Password" and provides real-time validation feedback
 * @param {string} inputId - ID of the input element
 * @param {string} bubbleId - ID of the bubble element
 * @param {Event} e - Input event
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType - Type of validation
 * @returns {void}
 */
export function inputEventlistener(inputId, bubbleId, e, inputType) {
  if (inputId === 'inputConfirmPassword') {
    const { passwordInput, currentValue, matchedValues } = getListenerConfig(e);
    if (matchedValues && passwordInput !== currentValue) {
      showValidateBubble(inputId, 'Passwords do not match', bubbleId);
      setFieldValidity(inputId, false);
      return;
    }
    if (matchedValues && passwordInput === currentValue) {
      showValidateBubble(inputId, 'Password Matches', bubbleId);
      setFieldValidity(inputId, true);
      return;
    }
  }
  const msg = getMessage(inputType, inputId, bubbleId, e);
  showValidateBubble(inputId, msg, bubbleId);
  const isValid = msg === 'Looks good!' || msg === 'Password Matches';
  setFieldValidity(inputId, isValid);
}

/**
 * Attaches validation rules and keyboard guards to an input field.
 * @description Applies input restrictions and validation logic based on field type
 * @param {HTMLInputElement} input - Input element to validate
 * @param {string} bubbleId - ID of the validation bubble
 * @param {{ allowInnerSpaces?: boolean, subtaskAllowed?: boolean, phoneMode?: boolean, dateMode?: boolean }} [options] - Validation options
 * @returns {void}
 */
export function validateInput(input, bubbleId, options = {}) {
  if (!input) return;
  if (input.dataset.validationAttached === "true") return;
  const { allowInnerSpaces = false, subtaskAllowed = false, phoneMode = false } = options;
  if (subtaskAllowed) {
    attachSubtaskSpaceHandler(input, bubbleId);
  } else {
    attachSpaceKeydownBlocker(input, bubbleId, allowInnerSpaces);
    if (allowInnerSpaces) attachLeadingSpaceNormalizer(input, bubbleId);
  }
  if (phoneMode) attachPhoneCharBlocker(input, bubbleId);
  input.dataset.validationAttached = "true";
}

/**
 * Prevents invalid spaces (leading/internal) via keyboard.
 * @description Blocks space key input based on position and settings
 * @param {HTMLInputElement} input - Input element
 * @param {string} bubbleId - ID of the validation bubble
 * @param {boolean} allowInnerSpaces - Allows single internal spaces
 * @returns {void}
 * @private
 */
function attachSpaceKeydownBlocker(input, bubbleId, allowInnerSpaces) {
  input.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;
    if (!allowInnerSpaces) {
      e.preventDefault();
      showValidateBubble(input.id, "Spaces are not allowed", bubbleId, 3000);
      return;
    }
    if (isLeadingSpacePosition(input)) {
      e.preventDefault();
      showValidateBubble(input.id, "Leading space is not allowed", bubbleId, 3000);
    }
  });
}

/**
 * Subtask-specific space logic: prevents leading and unselected end spaces.
 * @description Implements specialized space handling for subtask input fields
 * @param {HTMLInputElement} input - Input element
 * @param {string} bubbleId - ID of the validation bubble
 * @returns {void}
 * @private
 */
function attachSubtaskSpaceHandler(input, bubbleId) {
  input.addEventListener('keydown', (e) => {
    if (e.key !== ' ') return;
    const { atStart, atEndUnselected } = getSubtaskPositions(input);
    if (atStart) {
      e.preventDefault();
      showValidateBubble(input.id, "No leading space", bubbleId, 2000);
      return;
    }
    if (atEndUnselected) {
      showValidateBubble(input.id, "No end space allowed", bubbleId, 2000);
      return;
    }
  });
}

/**
 * Returns cursor positions for subtask space checking.
 * @description Calculates cursor position data for space validation logic
 * @param {HTMLInputElement} input - Input element
 * @returns {{ atStart: boolean, atEndUnselected: boolean }} Position data
 * @private
 */
function getSubtaskPositions(input) {
  const pos = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? pos;
  const val = input.value;
  const atStart = pos === 0;
  const atEndUnselected = end === val.length && pos === val.length;
  return { atStart, atEndUnselected };
}

/**
 * Restricts allowed characters for phone numbers (digits, leading +, / as separator).
 * @description Implements phone number input restrictions and validation
 * @param {HTMLInputElement} input - Input element
 * @param {string} bubbleId - ID of the validation bubble
 * @returns {void}
 * @private
 */
function attachPhoneCharBlocker(input, bubbleId) {
  input.addEventListener('keydown', (e) => {
    if (allowedInputBtn(e)) return;
    if (e.key === ' ') {
      e.preventDefault();
      showValidateBubble(input.id, "No spaces allowed", bubbleId, 2000);
      return;
    }
    if (/^\d$/.test(e.key)) return;
    if (e.key === '+' && input.selectionStart === 0 && !input.value.startsWith('+')) return;
    if (e.key === '/') {
      const pos = input.selectionStart ?? 0; const val = input.value;
      if (pos > 0 && val[pos - 1] !== '+' && val[pos - 1] !== '/' && !(val.startsWith('+') && pos === 1)) return;
    }
    e.preventDefault();
    showValidateBubble(input.id, "Only digits, optional leading + and / as separator", bubbleId, 2500);
  });
};

/**
 * Allows navigation/editing keys in keydown handlers.
 * @description Checks if a key should be allowed for navigation and editing
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean} true if key is allowed
 * @private
 */
function allowedInputBtn(event) {
  return (
    event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' ||
    event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
    event.key === 'Home' || event.key === 'End' || event.key === 'Shift'
  );
}

/**
 * Removes leading spaces live while typing (name fields).
 * @description Automatically strips leading whitespace from name input fields
 * @param {HTMLInputElement} input - Input element
 * @param {string} bubbleId - ID of the validation bubble
 * @returns {void}
 * @private
 */
function attachLeadingSpaceNormalizer(input, bubbleId) {
  input.addEventListener("input", () => {
    if (input.value.startsWith(" ")) {
      input.value = input.value.replace(/^\s+/, "");
      showValidateBubble(input.id, "Leading space is not allowed", bubbleId, 2000);
    }
  });
}

/**
 * Checks if cursor is at leading space position.
 * @description Determines if the cursor is positioned at a leading whitespace location
 * @param {HTMLInputElement} input - Input element
 * @returns {boolean} true if at leading space position
 * @private
 */
function isLeadingSpacePosition(input) {
  const pos = input.selectionStart ?? 0;
  if (pos === 0) return true;
  const left = input.value.slice(0, pos);
  return /^\s*$/.test(left);
}

/**
 * Returns the current validity of a field.
 * @description Retrieves the stored validation state for the specified field
 * @param {string} inputId - ID of the input field
 * @returns {boolean} Current validity state
 */
export function isFieldValid(inputId) {
  return fieldValidityState[inputId] === true;
}

/**
 * Sets the validity of a field.
 * @description Updates the stored validation state for the specified field
 * @param {string} inputId - ID of the input field
 * @param {boolean} isValid - Validity state to set
 * @returns {void}
 */
export function setFieldValidity(inputId, isValid) {
  fieldValidityState[inputId] = !!isValid;
}

/**
 * Wrapper for form validation (uses stored state).
 * @description Provides form validation interface using cached validity state
 * @param {string} inputId - ID of the input field
 * @param {string} _bubbleId - ID of the validation bubble (unused)
 * @returns {boolean} Current validity state
 */
export function confirmInputForFormValidation(inputId, _bubbleId) {
  return isFieldValid(inputId);
}

/**
 * Shows validation bubble with message and styling.
 * @description Displays validation feedback bubble with appropriate styling and timeout
 * @param {string} inputId - ID of the input field
 * @param {string} message - Validation message to display
 * @param {string} bubbleId - ID of the validation bubble
 * @param {number} [timeout=3000] - Display timeout in milliseconds
 * @returns {void}
 */
export function showValidateBubble(inputId, message, bubbleId, timeout = 3000) {
  const { inputIdElement, bubbleElement } = getBubbleElements(inputId, bubbleId);
  if (!inputIdElement || !bubbleElement) return;
  const isValid = checkBubbleContext(message, bubbleElement);
  toggleBubbleColor(inputIdElement, isValid);
  setBubbleTimeout(bubbleElement, timeout);
}

/**
 * Writes message to bubble and returns validity status.
 * @description Sets bubble content and determines if message indicates valid input
 * @param {string} message - Validation message
 * @param {HTMLElement} bubbleElement - Bubble DOM element
 * @returns {boolean} true if "Looks good!" or "Password Matches"
 * @private
 */
export function checkBubbleContext(message, bubbleElement) {
  bubbleElement.textContent = message;
  const isValid = message === 'Looks good!' || message === 'Password Matches';
  return isValid;
}

/**
 * Controls showing/hiding bubble via timeout.
 * @description Manages bubble visibility with automatic timeout handling
 * @param {HTMLElement} bubbleElement - Bubble DOM element
 * @param {number} timeout - Timeout duration in milliseconds
 * @returns {void}
 * @private
 */
function setBubbleTimeout(bubbleElement, timeout) {
  bubbleElement.classList.add('show');
  clearTimeout(bubbleElement.hideTimer);
  bubbleElement.hideTimer = setTimeout(() => bubbleElement.classList.remove('show'), timeout);
}

/**
 * Toggles validation border colors on input field.
 * @description Applies visual feedback styling to input field based on validation state
 * @param {HTMLElement} inputIdElement - Input DOM element
 * @param {boolean} isValid - Validation state
 * @returns {void}
 * @private
 */
function toggleBubbleColor(inputIdElement, isValid) {
  inputIdElement.classList.toggle('validate-border-blue', isValid);
  inputIdElement.classList.toggle('validate-border-red', !isValid);
}

/**
 * Returns references to input and bubble elements.
 * @description Retrieves DOM element references for input field and validation bubble
 * @param {string} inputId - ID of the input field
 * @param {string} bubbleId - ID of the validation bubble
 * @returns {{ inputIdElement: HTMLElement|null, bubbleElement: HTMLElement|null }} Element references
 * @private
 */
function getBubbleElements(inputId, bubbleId) {
  const inputIdElement = document.getElementById(inputId);
  const bubbleElement = document.getElementById(bubbleId);
  return { inputIdElement, bubbleElement };
}

/**
 * Hides the validation bubble.
 * @description Removes the validation bubble from display
 * @param {string} bubbleId - ID of the validation bubble
 * @returns {void}
 */
export function hideValidateBubble(bubbleId) {
  const bubbleElement = document.getElementById(bubbleId);
  if (bubbleElement) bubbleElement.classList.remove('show');
}