
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

initEmailField('loginEmail', 'emailHint');
initPasswordField('loginPassword', 'pwHint');


export function initEmailField(inputId, bubbleId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  validateInput(input, bubbleId);

  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => {
    const msg = getEmailMessage(e.target.value);
    showValidateBubble(input, msg || 'Looks good!', bubbleId);
    setFieldValidity(inputId, !msg);
  });

  input.addEventListener('focus', () =>
    showValidateBubble(input, 'Use 6–64 chars incl. upper, lower, number, special.', bubbleId, 2000)
  );

  input.addEventListener('blur', () => hideValidateBubble(bubbleId));
}

export function initPasswordField(inputId, bubbleId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  validateInput(input, bubbleId);

  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => {
    const msg = getPasswordMessage(e.target.value);
    showValidateBubble(input, msg || 'Looks good!', bubbleId);
    setFieldValidity(inputId, !msg);
  });

  input.addEventListener('focus', () =>
    showValidateBubble(input, 'Use 6–28 chars incl. upper, lower, number, special.', bubbleId, 2000)
  );

  input.addEventListener('blur', () => hideValidateBubble(bubbleId));
}

export function initNameField(inputId, bubbleId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  validateInput(input, bubbleId, { allowInnerSpaces: true });

  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => {
    const msg = getNameMessage(e.target.value);
    showValidateBubble(input, msg || 'Looks good!', bubbleId);
    setFieldValidity(inputId, !msg);
  });

  input.addEventListener('focus', () =>
    showValidateBubble(input, 'Use 6–28 chars incl. upper, lower, number, special.', bubbleId, 2000)
  );

  input.addEventListener('blur', () => hideValidateBubble(bubbleId));
}

export function initPhoneField(inputId, bubbleId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  validateInput(input, bubbleId);

  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => {
    const msg = getPhoneMessage(e.target.value);
    showValidateBubble(input, msg || 'Looks good!', bubbleId);
    setFieldValidity(inputId, !msg);
  });

  input.addEventListener('focus', () =>
    showValidateBubble(input, 'valid Options: +49 , 0176 12345 , +49 176 12 ', bubbleId, 2000)
  );

  input.addEventListener('blur', () => hideValidateBubble(bubbleId));
}

export function validateInput(input, bubbleId, options = {}, numberOptions = {}) {
  if (!input) return;
  const { allowInnerSpaces = false } = options;
  const { allowNumbers = false } = numberOptions;

  if (input.dataset.spaceBlockerAttached === "true") return;

  attachSpaceKeydownBlocker(input, bubbleId, allowInnerSpaces);
  if (bubbleId.includes("phone")) {
    attachSpaceAndLetterKeydownBlocker(input, bubbleId, allowInnerSpaces, allowNumbers);
  }

  if (allowInnerSpaces) {
    attachLeadingSpaceNormalizer(input, bubbleId);
  }

  input.dataset.spaceBlockerAttached = "true";
}

function attachSpaceKeydownBlocker(input, bubbleId, allowInnerSpaces) {
  input.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;

    if (!allowInnerSpaces) {
      e.preventDefault();
      showValidateBubble(input, "Spaces are not allowed", bubbleId, 3000);
      return;
    }

    if (isLeadingSpacePosition(input)) {
      e.preventDefault();
      showValidateBubble(input, "Leading space is not allowed", bubbleId, 3000);
    }
  });
}

function attachSpaceAndLetterKeydownBlocker(input, bubbleId, allowInnerSpaces, allowNumbers) {
  input.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;

    if (!allowInnerSpaces) {
      e.preventDefault();
      showValidateBubble(input, "Spaces are not allowed", bubbleId, 3000);
      return;
    }

    if (isLeadingSpacePosition(input)) {
      e.preventDefault();
      showValidateBubble(input, "Leading space is not allowed", bubbleId, 3000);
    }

    if (!allowNumbers) {
      e.preventDefault();
      showValidateBubble(input, "Letters are not allowed", bubbleId, 3000);
    }
  });

}

function attachLeadingSpaceNormalizer(input, bubbleId) {
  input.addEventListener("input", () => {
    if (input.value.startsWith(" ")) {
      input.value = input.value.replace(/^\s+/, "");
      showValidateBubble(input, "Leading space is not allowed", bubbleId, 2000);
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

export function showValidateBubble(_input, message, bubbleId, timeout = 3000) {
  const el = document.getElementById(bubbleId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el.hideTimer);
  el.hideTimer = setTimeout(() => el.classList.remove('show'), timeout);
}

export function hideValidateBubble(bubbleId) {
  const el = document.getElementById(bubbleId);
  if (el) el.classList.remove('show');
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
  return message.trim();
}

function getPasswordMessage(userInput) {
  let message = '';
  if (userInput.length < 6 || userInput.length > 28) message += 'Use 6–28 characters. ';
  if (!/[A-Z]/.test(userInput)) message += 'Add an uppercase. ';
  if (!/[a-z]/.test(userInput)) message += 'Add a lowercase. ';
  if (!/\d/.test(userInput)) message += 'Add a number. ';
  if (!/[^A-Za-z0-9]/.test(userInput)) message += 'Add a special char. ';
  return message.trim();
}

function getNameMessage(userInput) {
  const namePattern = /^(?! )(?:[A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ'´`-]+(?: [A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ'´`-]+)*)$/;
  let message = '';
  if (userInput.length < 6 || userInput.length > 32) {
    message += 'Use 6–32 characters. ';
  }
  if (!namePattern.test(userInput)) {
    message += 'Only letters, accents, hyphen, apostrophes, single spaces between parts. ';
  }
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
  return message.trim();
}