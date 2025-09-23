/**
 * Allowed top-level domains for email validation.
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
 * Email validation including TLD checking and various RFC-compliant checks.
 * @description Validates email addresses with comprehensive format, domain, and TLD verification
 * @param {string} userInput - Email address to validate
 * @returns {string} Validation message (empty or "Looks good!" on success)
 */
export function getEmailMessage(userInput) {
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
 * Password validation (length, upper/lowercase letters, number, symbol).
 * @description Validates password strength requirements including character diversity
 * @param {string} userInput - Password to validate
 * @returns {string} Validation message (empty or "Looks good!" on success)
 */
export function getPasswordMessage(userInput) {
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
 * Name validation (multi-part, accents, hyphens, single internal spaces).
 * @description Validates names allowing letters, accents, hyphens, apostrophes with proper spacing
 * @param {string} userInput - Name to validate
 * @returns {string} Validation message (empty or "Looks good!" on success)
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
 * Subtask text validation (character range, punctuation, spacing rules).
 * @description Validates subtask text allowing letters, numbers, common punctuation with proper spacing
 * @param {string} userInput - Subtask text to validate
 * @returns {string} Validation message (empty or "Looks good!" on success)
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
 * Phone number validation (digits, optional leading +, / as separator).
 * @description Validates phone numbers with international format support
 * @param {string} userInput - Phone number to validate
 * @returns {string} Validation message (empty or "Looks good!" on success)
 */
export function getPhoneMessage(userInput) {
    const pattern = /^\+?[0-9]+(?:\/[0-9]+)*$/;
    let message = '';
    if (userInput.length < 6 || userInput.length > 32) message += 'Use 6–32 characters. ';
    if (!pattern.test(userInput)) message += 'Allowed: digits, optional leading +, "/" as separator. ';
    if (!message) message = 'Looks good!';
    return message.trim();
}

/**
 * Date validation for <input type="date"> (YYYY-MM-DD, valid calendar date, not in the past).
 * @description Validates date input in ISO format ensuring it's a valid future or current date
 * @param {string} userInput - Expected ISO format YYYY-MM-DD
 * @returns {string} Validation message (empty or "Looks good!" on success)
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