/**
 * Initializes a dropdown menu that toggles on trigger click and closes when clicking outside.
 */
export function setupDropdown() {
  const trigger = document.getElementById("openMenu");
  const menu = document.getElementById("dropDownMenu");

  if (!trigger || !menu) return;

  trigger.addEventListener("click", (e) => handleTriggerClick(e, menu));
  menu.addEventListener("click", stopEventPropagation);
  document.addEventListener("click", (e) => handleDocumentClick(e, trigger, menu));
}

function handleTriggerClick(event, menu) {
  event.stopPropagation();
  menu.classList.toggle("dp-none");
}

function handleDocumentClick(event, trigger, menu) {
  const clickedOutside = !trigger.contains(event.target) && !menu.contains(event.target);
  if (clickedOutside) {
    menu.classList.add("dp-none");
  }
}

function stopEventPropagation(event) {
  event.stopPropagation();
}