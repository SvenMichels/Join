/**
 * Helper functions for contact-related operations
 */

import { clearContactListUI, renderAllContacts, clearBigContactView } from './contactRenderer.js';

/**
 * Adds a click event listener to a button inside a container.
 *
 * @function bindButton
 * @param {HTMLElement} container - The DOM element containing the button.
 * @param {string} selector - The CSS selector for the target button inside the container.
 * @param {Function} callback - The function to execute on click.
 *
 * @example
 * bindButton(document, "#deleteBtn", handleDelete);
 */
export function bindButton(container, selector, callback) {
  const button = container.querySelector(selector);
  if (button) {
    button.addEventListener('click', callback);
  }
}

/**
 * Displays the detailed contact view by removing the "dp-none" class.
 *
 * @function loadAndShowContactDetails
 * @example
 * loadAndShowContactDetails();
 */
export function loadAndShowContactDetails() {
  const bigContact = document.getElementById("bigContact");
  if (bigContact) {
    bigContact.classList.remove("dp-none");
  }
}

/**
 * Handles the UI update after a contact has been deleted.
 *
 * Clears the contact list, re-renders it, and clears the detailed contact view.
 *
 * @function handlePostDeleteView
 * @param {Object[]} list - The updated list of contacts.
 * @example
 * handlePostDeleteView(updatedContactList);
 */
export function handlePostDeleteView(list) {
  clearContactListUI();
  renderAllContacts(list);
  clearBigContactView();
  hideSingleContactView();
}

/**
 * Hides the single contact view by triggering a slide-out animation
 * and then setting its display to 'none' after the animation completes.
 * Also hides the floating action button (FAB) container if it exists.
 */
export function hideSingleContactView() {
  const single = document.querySelector('.singleContact');
  const fab = document.getElementById('fabContainer');
  if (!single) return;
  single.classList.remove('slide-in');
  single.classList.add('slide-out');
  setTimeout(() => {
    single.style.display = 'none';
    if (fab) fab.style.display = 'none';
  }, 300);
}

/**
 * Displays a temporary feedback message in the contact form.
 *
 * This function reveals an element with the ID `contactFeedback`,
 * plays its animation, and then hides it again after the animation ends
 * and a short delay. It returns a Promise that resolves once the feedback
 * has been hidden again.
 *
 * Usage example:
 * ```js
 * await contactFeedback();
 * console.log("Feedback animation finished");
 * ```
 *
 * @function contactFeedback
 * @returns {Promise<void>} Resolves once the feedback element is hidden.
 */

export function contactFeedback() {
  return new Promise((resolve) => {
    const LoginFeedback = document.getElementById("contactFeedback");
    if (!LoginFeedback) return resolve();

    LoginFeedback.classList.remove("dp-none");
    LoginFeedback.classList.add("centerFeedback");

    LoginFeedback.addEventListener(
      "animationend",
      () => {
        setTimeout(() => {
          LoginFeedback.classList.add("dp-none");
          LoginFeedback.classList.remove("centerFeedback");
          resolve();
        }, 1500);
      },
      { once: true }
    );
  });
}