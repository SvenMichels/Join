/**
 * Initializes a dropdown menu that toggles on trigger click and closes when clicking outside.
 */
// TODO: REFACTOR: This function is too large and does too many things. Consider breaking it down into smaller functions.
export function setupDropdown() {
  const dropdownTriggerElement = document.getElementById("openMenu");
  const dropdownMenuElement = document.getElementById("dropDownMenu");

  if (!dropdownTriggerElement || !dropdownMenuElement) return;

  dropdownTriggerElement.addEventListener("click", onTriggerClick);
  dropdownMenuElement.addEventListener("click", onMenuClick);
  document.addEventListener("click", onDocumentClick);

  function onTriggerClick(event) {
    event.stopPropagation();
    dropdownMenuElement.classList.toggle("dp-none");
  }

  function onMenuClick(event) {
    event.stopPropagation();
  }

  function onDocumentClick(event) {
    const clickedOutside =
      !dropdownTriggerElement.contains(event.target) &&
      !dropdownMenuElement.contains(event.target);

    if (clickedOutside) {
      dropdownMenuElement.classList.add("dp-none");
    }
  }
}
