/**
 * Initializes a dropdown menu that toggles on trigger click and closes when clicking outside.
 * @description Sets up event listeners for dropdown menu functionality with click handling
 * @returns {void}
 */
export function setupDropdown() {
  const trigger = document.getElementById("openMenu");
  const menu = document.getElementById("dropDownMenu");

  if (!trigger || !menu) return;

  trigger.addEventListener("click", (e) => handleTriggerClick(e, menu));
  menu.addEventListener("click", stopEventPropagation);
  document.addEventListener("click", (e) => handleDocumentClick(e, trigger, menu));
}

/**
 * Handles clicks on the menu trigger element.
 * @description Prevents event propagation and toggles menu visibility by toggling the "dp-none" CSS class
 * @param {MouseEvent} event - The click event from the trigger element
 * @param {HTMLElement} menu - The menu element whose visibility should be toggled
 * @returns {void}
 * @private
 */
function handleTriggerClick(event, menu) {
  event.stopPropagation();
  menu.classList.toggle("dp-none");
}

/**
 * Handles document clicks to close menu when clicking outside.
 * @description Checks if click occurred outside trigger and menu elements, then hides menu by adding "dp-none" class
 * @param {MouseEvent} event - The click event on the document
 * @param {HTMLElement} trigger - The trigger element that can open the menu
 * @param {HTMLElement} menu - The menu element that should be closed
 * @returns {void}
 * @private
 */
function handleDocumentClick(event, trigger, menu) {
  const clickedOutside = !trigger.contains(event.target) && !menu.contains(event.target);
  if (clickedOutside) {
    menu.classList.add("dp-none");
  }
}

/**
 * Stops event propagation through the DOM.
 * @description Prevents events from being handled by global or parent event handlers
 * @param {Event} event - The event whose propagation should be stopped
 * @returns {void}
 * @private
 */
function stopEventPropagation(event) {
  event.stopPropagation();
}