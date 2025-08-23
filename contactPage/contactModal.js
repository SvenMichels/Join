/**
 * Modal management logic
 */

/**
 * Closes all modal windows.
 */
export function handleWindowClosing() {
  closeAddWindow();
  closeEditWindow();
  clearBigContactView();
}

/**
 * Opens the modal window for adding a new contact.
 */
export function openContactAdditionWindow() {
  document.getElementById("addWindow").classList.remove("dp-none");
}

/**
 * Closes the "add contact" modal window.
 */
export function closeAddWindow() {
  document.getElementById("addWindow").classList.add("dp-none");
}

/**
 * Closes the "edit contact" modal window.
 */
export function closeEditWindow() {
  document.getElementById("editWindow").classList.add("dp-none");
}

/**
 * Displays a user feedback message for 3 seconds.
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