import { isMobileView } from "../utils/mobileUtils.js";
import { editContact, deleteContact } from "../../contactPage/contacts.js";

/**
 * Initializes the back button functionality for closing the single contact view on mobile.
 * Adds slide-out animation and hides the FAB container.
 */
export function initializeBackButton() {
  const singleContactEl = document.querySelector('.singleContact');
  const backBtn = document.getElementById('closeSingleMobile');
  const fabContainer = document.getElementById('fabContainer');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    singleContactEl.classList.remove('slide-in');
    singleContactEl.classList.add('slide-out');

    setTimeout(() => {
      singleContactEl.style.display = 'none';
      if (fabContainer) fabContainer.style.display = 'none';
    }, 300);
  });
}

/**
 * Initializes the floating action button (FAB) menu with edit and delete actions.
 *
 * @param {string} id - The ID of the selected contact.
 */
export function initializeFabMenu(id) {
  const elements = getFabElements();
  if (!elements) return;
  setupFabToggle(elements);
  setupFabActions(elements, id);
}

/**
 * Retrieves all necessary FAB elements if mobile view is active.
 *
 * @returns {{container: HTMLElement, toggle: HTMLElement, editBtn: HTMLElement, delBtn: HTMLElement}|null}
 * Returns the elements or null if not in mobile view.
 */
function getFabElements() {
  const container = document.getElementById('fabContainer');
  if (!container || !isMobileView()) return null;
  return {
    container,
    toggle:  document.getElementById('fabToggle'),
    editBtn:  document.getElementById('fabEdit'),
    delBtn:   document.getElementById('fabDelete'),
  };
}

/**
 * Sets up toggle functionality for the FAB menu.
 *
 * @param {{container: HTMLElement, toggle: HTMLElement}} param0 - The container and toggle button.
 */
function setupFabToggle({ container, toggle }) {
  container.classList.remove('open');
  toggle.addEventListener('click', () =>
    container.classList.toggle('open')
  );
}

/**
 * Sets up FAB actions: edit and delete for the selected contact.
 *
 * @param {{container: HTMLElement, editBtn: HTMLElement, delBtn: HTMLElement}} param0 - FAB elements.
 * @param {string} id - ID of the contact to edit or delete.
 */
function setupFabActions({ container, editBtn, delBtn }, id) {
  editBtn.addEventListener('click', () => {
    editContact(id);
    container.classList.remove('open');
  });
  delBtn.addEventListener('click', async () => {
    await deleteContact(id);
    container.classList.remove('open');
  });
}
