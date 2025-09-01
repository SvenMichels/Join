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
  let elements = getFabElements();
  if (!elements) return;
  elements = resetFabBindings(elements);
  showFabContainer(elements.container);
  setupFabToggle(elements);
  setupFabActions(elements, contact);
  bindOutsideClickToClose(elements.container)
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
  const toggle = document.getElementById('fabToggle');
  const editBtn = document.getElementById('fabEdit');
  const delBtn = document.getElementById('fabDelete');
  if (!container || !toggle || !editBtn || !delBtn) return null;
  return { container, toggle, editBtn, delBtn };
}

/**
 * Sets up toggle functionality for the FAB menu.
 *
 * @param {{container: HTMLElement, toggle: HTMLElement}} param0 - The container and toggle button.
 */

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

/**
 * Bindet einen globalen Klick-Listener, um ein Container-Element bei Klicks außerhalb zu schließen.
 *
 * - Verhindert Mehrfachbindung durch die Prüfung von `outsideClickHandlerBound`.
 * - Fügt dem `document` einen `click`-Listener hinzu, der prüft,
 *   ob der Klick nicht innerhalb des übergebenen Containers erfolgt ist.
 * - Wenn der Klick außerhalb liegt, wird die CSS-Klasse `"open"` 
 *   vom Container entfernt, sodass er geschlossen wird.
 *
 * Voraussetzungen:
 * - Eine globale Variable `outsideClickHandlerBound` muss existieren,
 *   um Mehrfachregistrierungen des Listeners zu verhindern.
 *
 * @function bindOutsideClickToClose
 * @param {HTMLElement} container - Das Container-Element, das geschlossen werden soll, wenn außerhalb geklickt wird.
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
function bindOutsideClickToClose(container) {
  if (outsideClickHandlerBound) return

  document.addEventListener("click", function handleClick(e) {
    if (!container.contains(e.target)) {
      container.classList.remove("open")
    }
  })

  outsideClickHandlerBound = true
}

/**
 * Resets all event listeners on FAB elements by cloning and replacing them.
 * Ensures old or duplicated bindings are removed before reinitializing the FAB menu.
 *
 * @param {Object} elements - The FAB elements object containing container, toggle, editBtn, and delBtn
 * @param {HTMLElement} elements.container - FAB container element
 * @param {HTMLElement} elements.toggle - FAB toggle button
 * @param {HTMLElement} elements.editBtn - FAB edit action button
 * @param {HTMLElement} elements.delBtn - FAB delete action button
 * @returns {Object} New FAB elements object with fresh, unbound elements
 */
function resetFabBindings({ container, toggle, editBtn, delBtn }) {
  container.classList.remove('open');
  const newToggle = toggle.cloneNode(true);
  const newEdit = editBtn.cloneNode(true);
  const newDel = delBtn.cloneNode(true);
  toggle.replaceWith(newToggle);
  editBtn.replaceWith(newEdit);
  delBtn.replaceWith(newDel);
  return { container, toggle: newToggle, editBtn: newEdit, delBtn: newDel };
}
