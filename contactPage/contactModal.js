/**
 * Modal Management für Kontakte
 */

/**
 * Behandelt Fenster-Schließung
 */
function handleWindowClosing() {
  closeAddWindow();
  closeEditWindow();
  clearBigContactView();
}

/**
 * Öffnet Kontakt-Hinzufügungsfenster
 */
function openContactAdditionWindow() {
  showElementsForContactHandling();
  document.getElementById("myModal").style.display = "block";
  document.getElementById("myModalBg").style.display = "block";
}

/**
 * Schließt Hinzufügungsfenster
 */
function closeAddWindow() {
  document.getElementById("myModal").style.display = "none";
  document.getElementById("myModalBg").style.display = "none";
}

/**
 * Schließt Bearbeitungsfenster
 */
function closeEditWindow() {
  document.getElementById("myModalEdit").style.display = "none";
  document.getElementById("myModalBgEdit").style.display = "none";
}

/**
 * Zeigt Elemente für Kontakt-Behandlung
 */
function showElementsForContactHandling() {
  document.querySelector(".contact-dialog").style.display = "block";
  document.querySelector(".contact-edit-dialog").style.display = "none";
}

/**
 * Zeigt User-Feedback
 */
function showUserFeedback() {
  document.getElementById("contactAddedText").style.display = "block";
  setTimeout(() => {
    document.getElementById("contactAddedText").style.display = "none";
  }, 3000);
}
