/**
 * @fileoverview Zentrale Eingabe-Validierung und Validierungs-Bubbles.
 * Unterstützt u. a. E-Mail, Passwort, Name, Telefon, Subtask-Text und Datum.
 * Enthält Initialisierer für Input-Felder inkl. Live-Feedback.
 * @module Validation
 */

/**
 * Zulässige Top-Level-Domains für E-Mail-Validierung.
 * @type {string[]}
 */
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

/**
 * Interner Speicher der Feld-Gültigkeit pro Input-ID.
 * @type {Record<string, boolean>}
 */
const fieldValidityState = Object.create(null);

initInputField('loginEmail', 'emailHint', 'email');
initInputField('loginPassword', 'pwHint', 'password');

/**
 * Initialisiert ein Eingabefeld mit Validierung und Validierungs-Bubble.
 * Bindet Input-/Focus-/Blur-Handler und setzt Startzustand.
 * @param {string} inputId - ID des Input-Elements
 * @param {string} bubbleId - ID des Bubble-Elements für Meldungen
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType - Typ der Validierung
 * @returns {void}
 */
export function initInputField(inputId, bubbleId, inputType) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const allowInnerSpaces = inputType === 'name';
  const subtaskAllowed = inputType === 'subtask';
  const phoneMode = inputType === 'phone';
  const dateMode = inputType === 'date';

  validateInput(input, bubbleId, { allowInnerSpaces, subtaskAllowed, phoneMode, dateMode });
  setFieldValidity(inputId, false);

  input.addEventListener('input', (e) => inputEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('focus', (e) => focusEventlistener(inputId, bubbleId, e, inputType));
  input.addEventListener('blur', () => { inputTrimmer(input); hideValidateBubble(bubbleId); });
}

/**
 * Schneidet führende und nachgestellte Leerzeichen vom aktuellen Input-Wert.
 * @param {HTMLInputElement} input - Das Eingabefeld
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
 * Focus-Handler: zeigt kontextbasierte Validierungsnachricht.
 * Handhabt Sonderfall "Confirm Password".
 * @param {string} inputId
 * @param {string} bubbleId
 * @param {Event} e
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType
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
 * Liefert eine Validierungsnachricht abhängig vom Eingabetyp.
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType
 * @param {string} inputId
 * @param {string} bubbleId
 * @param {Event} e
 * @returns {string} Meldungstext
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
 * Liest Vergleichswerte für Passwort/Bestätigung aus dem DOM.
 * @param {Event} e
 * @returns {{ passwordInput: string, currentValue: string, matchedValues: boolean }}
 * @private
 */
function getListenerConfig(e) {
  const passwordInput = document.getElementById('inputPassword')?.value || '';
  const currentValue = e.target.value;
  const matchedValues = passwordInput.length >= 6 && currentValue.length >= 6;
  return { passwordInput, currentValue, matchedValues };
}

/**
 * Input-Handler: live Validieren und Bubble aktualisieren.
 * Handhabt Sonderfall "Confirm Password".
 * @param {string} inputId
 * @param {string} bubbleId
 * @param {Event} e
 * @param {'email'|'password'|'name'|'phone'|'subtask'|'date'} inputType
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
 * Hängt Validierungsregeln und Tastatur-Guards an ein Eingabefeld.
 * @param {HTMLInputElement} input
 * @param {string} bubbleId
 * @param {{ allowInnerSpaces?: boolean, subtaskAllowed?: boolean, phoneMode?: boolean, dateMode?: boolean }} [options]
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
 * Verhindert unzulässige Leerzeichen (führend/innen) per Tastatur.
 * @param {HTMLInputElement} input
 * @param {string} bubbleId
 * @param {boolean} allowInnerSpaces - Erlaubt einfache Innen-Leerzeichen
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
 * Subtask-spezifische Leerzeichen-Logik:
 * verbietet führende und unselektierte End-Leerzeichen.
 * @param {HTMLInputElement} input
 * @param {string} bubbleId
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
 * Liefert Cursor-Positionen für Subtask-Leerzeichenprüfung.
 * @param {HTMLInputElement} input
 * @returns {{ atStart: boolean, atEndUnselected: boolean }}
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
 * Beschränkt erlaubte Zeichen für Telefonnummern (Ziffern, führendes +, / als Trenner).
 * @param {HTMLInputElement} input
 * @param {string} bubbleId
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
 * Erlaubt Navigations-/Editiertasten in Keydown-Handlern.
 * @param {KeyboardEvent} event
 * @returns {boolean} true, wenn Taste erlaubt ist
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
 * Entfernt führende Leerzeichen live beim Tippen (Name-Felder).
 * @param {HTMLInputElement} input
 * @param {string} bubbleId
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
 * Prüft, ob Cursor an führender Leerzeichenposition steht.
 * @param {HTMLInputElement} input
 * @returns {boolean}
 * @private
 */
function isLeadingSpacePosition(input) {
  const pos = input.selectionStart ?? 0;
  if (pos === 0) return true;
  const left = input.value.slice(0, pos);
  return /^\s*$/.test(left);
}

/**
 * Liefert die aktuelle Gültigkeit eines Felds.
 * @param {string} inputId
 * @returns {boolean}
 */
export function isFieldValid(inputId) {
  return fieldValidityState[inputId] === true;
}

/**
 * Setzt die Gültigkeit eines Felds.
 * @param {string} inputId
 * @param {boolean} isValid
 * @returns {void}
 */
export function setFieldValidity(inputId, isValid) {
  fieldValidityState[inputId] = !!isValid;
}

/**
 * Wrapper für Formularvalidierung (nutzt gespeicherten Zustand).
 * @param {string} inputId
 * @param {string} _bubbleId
 * @returns {boolean}
 */
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

/**
 * Schreibt Nachricht in die Bubble und liefert Validitätsstatus.
 * @param {string} message
 * @param {HTMLElement} bubbleElement
 * @returns {boolean} true, wenn "Looks good!" oder "Password Matches"
 * @private
 */
function checkBubbleContext(message, bubbleElement) {
  bubbleElement.textContent = message;
  const isValid = message === 'Looks good!' || message === 'Password Matches';
  return isValid;
}

/**
 * Steuert Ein-/Ausblenden der Bubble via Timeout.
 * @param {HTMLElement} bubbleElement
 * @param {number} timeout
 * @returns {void}
 * @private
 */
function setBubbleTimeout(bubbleElement, timeout) {
  bubbleElement.classList.add('show');
  clearTimeout(bubbleElement.hideTimer);
  bubbleElement.hideTimer = setTimeout(() => bubbleElement.classList.remove('show'), timeout);
}

/**
 * Toggelt Validierungs-Border-Farben am Eingabefeld.
 * @param {HTMLElement} inputIdElement
 * @param {boolean} isValid
 * @returns {void}
 * @private
 */
function toggleBubbleColor(inputIdElement, isValid) {
  inputIdElement.classList.toggle('validate-border-blue', isValid);
  inputIdElement.classList.toggle('validate-border-red', !isValid);
}

/**
 * Liefert Referenzen auf Input- und Bubble-Element.
 * @param {string} inputId
 * @param {string} bubbleId
 * @returns {{ inputIdElement: HTMLElement|null, bubbleElement: HTMLElement|null }}
 * @private
 */
function getBubbleElements(inputId, bubbleId) {
  const inputIdElement = document.getElementById(inputId);
  const bubbleElement = document.getElementById(bubbleId);
  return { inputIdElement, bubbleElement };
}

/**
 * Blendet die Validierungs-Bubble aus.
 * @param {string} bubbleId
 * @returns {void}
 */
export function hideValidateBubble(bubbleId) {
  const bubbleElement = document.getElementById(bubbleId);
  if (bubbleElement) bubbleElement.classList.remove('show');
}

/**
 * E-Mail-Validierung inkl. TLD-Prüfung und diversen RFC-nahen Checks.
 * @param {string} userInput
 * @returns {string} Validierungsnachricht
 */
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

/**
 * Passwort-Validierung (Länge, Groß-/Kleinbuchstaben, Zahl, Symbol).
 * @param {string} userInput
 * @returns {string} Validierungsnachricht
 */
function getPasswordMessage(userInput) {
  let message = '';
  if (userInput.length < 6 || userInput.length > 32) message += 'Use 6–32 characters. ';
  if (!/[A-Z]/.test(userInput)) message += 'Add a capital letter. ';
  if (!/[a-z]/.test(userInput)) message += 'Add a lowercase letter. ';
  if (!/\d/.test(userInput)) message += 'Add a number. ';
  if (!/[^A-Za-z0-9]/.test(userInput)) message += 'Add a symbol. ';
  if (!message) message = 'Looks good! ';
  return message.trim();
}

/**
 * Name-Validierung (Mehrteilig, Akzente, Bindestriche, einfache Innen-Leerzeichen).
 * @param {string} userInput
 * @returns {string} Validierungsnachricht
 */
export function getNameMessage(userInput) {
  let message = '';
  const value = String(userInput ?? '');
  if (/^\s/.test(value)) return 'No leading space.';
  if (value.length < 4 || value.length > 128) return 'Use 4–128 characters.';
  if (/ {2,}/.test(value)) return 'Only single spaces between parts.';
  const NAME_PART = "[A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ'´`-]+";
  const NAME_PATTERN = new RegExp(`^${NAME_PART}(?: ${NAME_PART})*(?: )?$`);
  if (!NAME_PATTERN.test(value)) return 'Only letters, accents, hyphens, apostrophes.';
  if (!message) message = 'Looks good! ';
  return message.trim();
}

/**
 * Subtask-Text-Validierung (Zeichenumfang, Interpunktion, Leerzeichenregeln).
 * @param {string} userInput
 * @returns {string} Validierungsnachricht
 */
export function getSubtaskMessage(userInput) {
  let message = '';
  const value = String(userInput ?? '');
  if (/^\s/.test(value)) return 'No leading space.';
  if (value.length < 4 || value.length > 128) return 'Use 4–128 characters.';
  if (/ {2,}/.test(value)) return 'Only single spaces between parts.';
  const SUB_PART = "[A-Za-zÀ-ÖØ-öø-ÿĀ-žȘșȚțßẞ0-9.,:;!?\\\"'()\\[\\]{}/_+&@#%*°€$-]+";
  const SUB_PATTERN = new RegExp(`^${SUB_PART}(?: ${SUB_PART})*(?: )?$`);
  if (!SUB_PATTERN.test(value)) return 'Letters, numbers & common punctuation only.';
  if (!message) message = 'Looks good! ';
  return message.trim();
}

/**
 * Telefonnummer-Validierung (Ziffern, optional führendes +, / als Trenner).
 * @param {string} userInput
 * @returns {string} Validierungsnachricht
 */
function getPhoneMessage(userInput) {
  const pattern = /^\+?[0-9]+(?:\/[0-9]+)*$/;
  let message = '';
  if (userInput.length < 6 || userInput.length > 32) message += 'Use 6–32 characters. ';
  if (!pattern.test(userInput)) message += 'Allowed: digits, optional leading +, "/" as separator. ';
  if (!message) message = 'Looks good!';
  return message.trim();
}

/**
 * Datum-Validierung für <input type="date"> (YYYY-MM-DD, echter Kalendertag, nicht in der Vergangenheit).
 * @param {string} userInput - Erwartet ISO-Format YYYY-MM-DD
 * @returns {string} Validierungsnachricht
 */
export function getDateMessage(userInput) {
  const value = String(userInput ?? '').trim();
  if (!value) return 'Select a date.';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return 'Invalid date format (YYYY-MM-DD).';
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return 'Invalid calendar date.';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  if (dt < today) return 'Date cannot be in the past.';
  return 'Looks good!';
}