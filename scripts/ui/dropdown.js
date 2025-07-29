/**
 * Initializes a dropdown menu that toggles on trigger click and closes when clicking outside.
 *
 * @param {string} triggerSelector - CSS selector for the trigger element that toggles the dropdown.
 * @param {string} menuSelector - CSS selector for the dropdown menu element.
 */
export function setupDropdown(triggerSelector, menuSelector) {
  const dropdownTriggerElement = document.querySelector(triggerSelector);
  const dropdownMenuElement = document.querySelector(menuSelector);

  function onTriggerClick(clickEvent) {
    clickEvent.stopPropagation();
    dropdownMenuElement.classList.toggle('dp-none');
  }

  function onMenuClick(clickEvent) {
    clickEvent.stopPropagation();
  }

  /**
   * Closes dropdown when clicking outside the menu or trigger.
   */
  function onDocumentClick() {
    dropdownMenuElement.classList.add('dp-none');
  }

  dropdownTriggerElement.addEventListener('click', onTriggerClick);
  dropdownMenuElement.addEventListener('click', onMenuClick);
  document.addEventListener('click', onDocumentClick);
}
