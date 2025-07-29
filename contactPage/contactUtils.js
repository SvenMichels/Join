/**
 * Hilfsfunktionen für Kontakte
 */

import { clearContactListUI, renderAllContacts, clearBigContactView } from './contactRenderer.js';

/**
 * Button-Event hinzufügen
 */
export function bindButton(container, selector, callback) {
  const button = container.querySelector(selector);
  if (button) {
    button.addEventListener('click', callback);
  }
}

/**
 * Kontaktdetails anzeigen
 */
export function loadAndShowContactDetails() {
  const bigContact = document.getElementById("bigContact");
  if (bigContact) {
    bigContact.classList.remove("dp-none");
  }
}

/**
 * Nach Löschung aufräumen
 */
export function handlePostDeleteView(list) {
  clearContactListUI();
  renderAllContacts(list);
  clearBigContactView();
}
