/**
 * Selects the first element that matches the given CSS selector.
 * @param {string} sel - A CSS selector string.
 * @returns {Element|null} The first matching Element or null if none found.
 */
export const $ = sel => document.querySelector(sel)

/**
 * Attaches an event listener to a target element.
 * @param {Element|Window|Document|null} el - The target element to bind the event to.
 * @param {string} evt - The event type to listen for.
 * @param {Function} fn - The callback function to invoke when the event occurs.
 */
export const on = (el, evt, fn) => el?.addEventListener(evt, fn)

/**
 * Sets the text content of the element matching the selector.
 * @param {string} selector - A CSS selector string for the target element.
 * @param {string|number} value - The text to set as the element's content.
 */
export const setText = (selector, value) => { const el = document.querySelector(selector); if (el) el.textContent = value }

/**
 * Generates initials from a full name string.
 * @param {string} name - The full name (e.g., "Jane Doe").
 * @returns {string} The initials in uppercase (e.g., "JD").
 */
export const getInitials = name => name.split(' ').map(n => n[0]).join('').toUpperCase()
