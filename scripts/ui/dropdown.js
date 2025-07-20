// Setup dropdown with click outside to close
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
   * Closes dropdown when clicking outside
   */
  function onDocumentClick() {
    dropdownMenuElement.classList.add('dp-none');
  }

  dropdownTriggerElement.addEventListener('click', onTriggerClick);
  dropdownMenuElement.addEventListener('click', onMenuClick);
  document.addEventListener('click', onDocumentClick);
}