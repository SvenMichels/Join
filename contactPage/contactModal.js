/**
 * Modals verwalten
 */

/**
 * Alle Fenster schließen
 */
export function handleWindowClosing() {
  closeAddWindow();
  closeEditWindow();
  clearBigContactView();
}

/**
 * Kontakt hinzufügen öffnen
 */
export function openContactAdditionWindow() {
  document.getElementById("addWindow").classList.remove("dp-none");
}

/**
 * Hinzufügen-Fenster schließen
 */
export function closeAddWindow() {
  document.getElementById("addWindow").classList.add("dp-none");
}

/**
 * Bearbeiten-Fenster schließen
 */
export function closeEditWindow() {
  document.getElementById("editWindow").classList.add("dp-none");
}

/**
 * Erfolgs-Nachricht anzeigen
 */
export function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (feedback) {
    feedback.style.display = "block";
    setTimeout(() => {
      feedback.style.display = "none";
    }, 3000);
  }
}
