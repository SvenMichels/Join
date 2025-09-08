
const allowedTlds = [
  'com', 'net', 'org', 'info', 'biz', 'name', 'pro', 'xyz',
  'online', 'site', 'tech', 'app', 'shop', 'co', 'io',
  'dev', 'ai', 'cloud',
  'de', 'uk', 'fr', 'es', 'it', 'nl', 'pl', 'eu', 'ch', 'be',
  'se', 'dk', 'no', 'fi', 'at', 'ie', 'pt', 'gr', 'cz', 'hu',
  'ro', 'sk', 'si', 'hr', 'bg', 'lt', 'lv', 'ee', 'lu', 'is',
  'mk', 'al', 'rs', 'ba', 'me', 'md', 'cy', 'mt', 'ad', 'li',
  'sm', 'va', 'mc', 'fo', 'gl'
];

const fieldValidityState = Object.create(null);

initInputField('loginEmail', 'emailHint', 'email');
initInputField('loginPassword', 'pwHint', 'password');

export function initInputField(inputId, bubbleId, inputType) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const allowInnerSpaces = inputType === 'name';
  const blockLetters = inputType === 'phone';
  const subtaskAllowed = inputId === 'subtask';

  validateInput(input, bubbleId, { allowInnerSpaces, blockLetters, subtaskAllowed });
  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => inputEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('focus', (e) => focusEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('blur', () => hideValidateBubble(bubbleId));
}

export function focusEventlistener(inputId, bubbleId, e, inputType) {
  if (inputId === 'inputConfirmPassword') {
    const { passwordInput, currentValue, matchedValues } = getListenerConfig(e);
    if (matchedValues && passwordInput !== currentValue) {
      showValidateBubble(inputId, 'Looks good!, but Passwords do not match', bubbleId, 2000);
      setFieldValidity(inputId, false);
      return;
    }
    if (matchedValues && passwordInput === currentValue) {
      showValidateBubble(inputId, 'Password Matches', bubbleId, 2000);
      setFieldValidity(inputId, true);
      return;
    }
  }
  const msg = getMessage(inputType, e);
  showValidateBubble(inputId, msg, bubbleId, 2000);
}

function getMessage(inputType, e) {
  let msg = '';
  if (inputType === 'email') msg = getEmailMessage(e.target.value);
  if (inputType === 'password') msg = getPasswordMessage(e.target.value);
  if (inputType === 'name') msg = getNameMessage(e.target.value);
  if (inputType === 'phone') msg = getPhoneMessage(e.target.value);
  if (msg === '') msg = 'Looks good!';
  return msg;
}

function getListenerConfig(e) {
  const passwordInput = document.getElementById('inputPassword')?.value || '';
  const currentValue = e.target.value;
  const matchedValues = passwordInput.length >= 6 && currentValue.length >= 6;
  return { passwordInput, currentValue, matchedValues };
}

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

  const msg = getMessage(inputType, e);

  showValidateBubble(inputId, msg, bubbleId);
  const isValid = msg === '' || /^Looks good!?$/i.test(msg) || msg === 'Password Matches';
  setFieldValidity(inputId, isValid);
}

export function validateInput(input, bubbleId, options = {}) {
  if (!input) return;
  if (input.dataset.validationAttached === "true") return;

  const { allowInnerSpaces = false, blockLetters = false, subtaskAllowed = false } = options;

  attachSpaceKeydownBlocker(input, bubbleId, allowInnerSpaces);
  if (allowInnerSpaces) attachLeadingSpaceNormalizer(input, bubbleId);
  if (blockLetters) attachLetterBlocker(input, bubbleId);
  if (subtaskAllowed) attachLeadingSpaceNormalizer(input, bubbleId);

  input.dataset.validationAttached = "true";
}

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

function attachLetterBlocker(input, bubbleId) {
  input.addEventListener("keydown", (e) => {
    if (e.key.length === 1 && /\p{L}/u.test(e.key)) {
      e.preventDefault();
      showValidateBubble(input.id, "Letters are not allowed here!", bubbleId, 3000);
    }
  });
}

function attachLeadingSpaceNormalizer(input, bubbleId) {
  input.addEventListener("input", () => {
    if (input.value.startsWith(" ")) {
      input.value = input.value.replace(/^\s+/, "");
      showValidateBubble(input.id, "Leading space is not allowed", bubbleId, 2000);
    }
  });
}

function isLeadingSpacePosition(input) {
  const pos = input.selectionStart ?? 0;
  if (pos === 0) return true;
  const left = input.value.slice(0, pos);
  return /^\s*$/.test(left);
}

export function isFieldValid(inputId) {
  return fieldValidityState[inputId] === true;
}

export function setFieldValidity(inputId, isValid) {
  fieldValidityState[inputId] = !!isValid;
}

export function confirmInputForFormValidation(inputId, _bubbleId) {
  return isFieldValid(inputId);
}

export function showValidateBubble(inputId, message, bubbleId, timeout = 3000) {
  const { inputIdElement, bubbleElement } = getBubbleElements(inputId, bubbleId);
  if (!inputIdElement || !bubbleElement) return;
  const isValid = checkBubbleContext(message, bubbleElement);
  toggleBubbleColor(inputIdElement, isValid);
  setBubbleTimeout(bubbleElement, timeout);
}

function checkBubbleContext(message, bubbleElement) {
  bubbleElement.textContent = message;
  const isValid = message === 'Looks good!' || message === 'Password Matches';
  return isValid;
}

function setBubbleTimeout(bubbleElement, timeout) {
  bubbleElement.classList.add('show');
  clearTimeout(bubbleElement.hideTimer);
  bubbleElement.hideTimer = setTimeout(() => bubbleElement.classList.remove('show'), timeout);
}

function toggleBubbleColor(inputIdElement, isValid) {
  inputIdElement.classList.toggle('validate-border-blue', isValid);
  inputIdElement.classList.toggle('validate-border-red', !isValid);
}

function getBubbleElements(inputId, bubbleId) {
  const inputIdElement = document.getElementById(inputId.id || inputId);
  const bubbleElement = document.getElementById(bubbleId.id || bubbleId);
  return { inputIdElement, bubbleElement };
}

export function hideValidateBubble(bubbleId) {
  const bubbleElement = document.getElementById(bubbleId);
  if (bubbleElement) bubbleElement.classList.remove('show');
}

function getEmailMessage(userInput) {
  let message = '';
  if (userInput.length < 6 || userInput.length > 64) message += 'Use 6–64 characters. ';
  if ((userInput.match(/@/g) || []).length !== 1) return (message + 'Must contain exactly one "@".').trim();
  const [localPart, domainPart] = userInput.split('@');
  if (!localPart) message += 'Local part empty. ';
  if (!domainPart) return (message + 'Domain part empty.').trim();
  if (!/^[A-Za-z0-9._-]+$/.test(localPart) || /\.{2,}/.test(localPart) || localPart.startsWith('.') || localPart.endsWith('.')) message += 'Invalid local part. ';
  if (!/^[A-Za-z0-9.-]+$/.test(domainPart) || /\.{2,}/.test(domainPart) || domainPart.startsWith('-') || domainPart.endsWith('-') || domainPart.startsWith('.') || domainPart.endsWith('.')) message += 'Invalid domain. ';
  const tld = domainPart.split('.').pop().toLowerCase();
  if (!allowedTlds.includes(tld)) message += `TLD not allowed. `;
  if (localPart && domainPart && !message) message = 'Looks good! ';
  return message.trim();
}

function getPasswordMessage(userInput) {
  let message = '';
  if (userInput.length < 6 || userInput.length > 28) message += 'Use 6–28 characters. ';
  if (!/[A-Z]/.test(userInput)) message += 'Add an uppercase. ';
  if (!/[a-z]/.test(userInput)) message += 'Add a lowercase. ';
  if (!/\d/.test(userInput)) message += 'Add a number. ';
  if (!/[^A-Za-z0-9]/.test(userInput)) message += 'Add a special char. ';
  if (!message) message = 'Looks good! ';
  return message.trim();
}

function getNameMessage(userInput) {
  const namePattern = /^(?! )(?:[A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ'´`-]+(?: [A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ'´`-]+)*)$/;
  let message = '';
  if (userInput.length < 6 || userInput.length > 32) {
    message = 'Use 6–32 characters. ';
  }
  if (!namePattern.test(userInput)) {
    message += 'Only letters, accents, hyphen, apostrophes, single spaces between parts. ';
  }
  if (!message) message = 'Looks good! ';
  return message.trim();
}

function getPhoneMessage(userInput) {
  const phonePattern = /^(?! )(?:\+?\d+(?: \d+)*)$/;
  let message = '';
  if (userInput.length < 6 || userInput.length > 32) {
    message += 'Use 6–32 characters. ';
  }
  if (!phonePattern.test(userInput)) {
    message += 'valid Options: +49 , 0176 12345 , +49 176 12 ';
  }
  if (!message) message = 'Looks good! ';
  return message.trim();
}