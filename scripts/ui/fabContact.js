import { isMobileView } from "../utils/mobileUtils.js";
import { openEditDialog } from "../../contactPage/contactEditor.js";
import { deleteContactFromDatabase } from "../../contactPage/contactDataService.js";

let outsideClickHandlerBound = false


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
      outsideClickHandlerBound = false
    }, 300);
  });
}

/**
 * Initializes the floating action button (FAB) menu with edit and delete actions.
 *
 * @param {string} id - The ID of the selected contact.
 */
export function initializeFabMenu(contact) {
  const elements = getFabElements();
  if (!elements) return;

  showFabContainer(elements.container);
  setupFabToggle(elements);
  setupFabActions(elements, contact);
  bindOutsideClickToClose(elements.container)
  console.log("fab menu working")
}

/**
 * Makes the FAB container visible.
 *
 * @param {HTMLElement} container - The FAB container element.
 */
function showFabContainer(container) {
  container.style.display = 'block';
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
// function setupFabToggle({ container, toggle }) {
//   container.classList.remove('open');
//   toggle.addEventListener('click', () =>
//     container.classList.toggle('open')
//   );
// }

function setupFabToggle({ container, toggle }) {
  toggle.addEventListener("click", (e) => {
    e.stopPropagation()
    container.classList.toggle("open")
  })
}

/**
 * Sets up FAB actions: edit and delete for the selected contact.
 *
 * @param {{container: HTMLElement, editBtn: HTMLElement, delBtn: HTMLElement}} param0 - FAB elements.
 * @param {string} id - ID of the contact to edit or delete.
 */
function setupFabActions({ container, editBtn, delBtn }, contact) {
  editBtn.addEventListener('click', () => {
    openEditDialog(contact);
    container.classList.remove('open');
  });
  delBtn.addEventListener('click', async () => {
    await deleteContactFromDatabase(contact.userId, contact.userFullName);
    container.classList.remove('open');
  });
}

function bindOutsideClickToClose(container) {
  if (outsideClickHandlerBound) return

  document.addEventListener("click", function handleClick(e) {
    if (!container.contains(e.target)) {
      container.classList.remove("open")
    }
  })

  outsideClickHandlerBound = true
}
