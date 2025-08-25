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

/**
 * Behandelt den Klick auf das Menü-Trigger-Element.
 *
 * - Verhindert, dass das Klick-Event weiter nach oben im DOM propagiert.
 * - Schaltet die Sichtbarkeit des übergebenen Menüs,
 *   indem die CSS-Klasse `"dp-none"` getoggelt wird.
 *
 * @function handleTriggerClick
 * @param {MouseEvent} event - Das Klick-Event des Triggers.
 * @param {HTMLElement} menu - Das Menüelement, dessen Sichtbarkeit umgeschaltet werden soll.
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
function handleTriggerClick(event, menu) {
  event.stopPropagation();
  menu.classList.toggle("dp-none");
}

/**
 * Behandelt Klicks auf das Dokument, um das Menü bei einem Klick außerhalb zu schließen.
 *
 * - Prüft, ob der Klick weder auf das Trigger-Element noch auf das Menü selbst erfolgt ist.
 * - Falls außerhalb geklickt wurde, wird die CSS-Klasse `"dp-none"`
 *   auf das Menü gesetzt, sodass es verborgen wird.
 *
 * @function handleDocumentClick
 * @param {MouseEvent} event - Das Klick-Event auf dem Dokument.
 * @param {HTMLElement} trigger - Das Trigger-Element, das das Menü öffnen kann.
 * @param {HTMLElement} menu - Das Menüelement, das geschlossen werden soll.
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
function handleDocumentClick(event, trigger, menu) {
  const clickedOutside = !trigger.contains(event.target) && !menu.contains(event.target);
  if (clickedOutside) {
    menu.classList.add("dp-none");
  }
}

/**
 * Stoppt die Weitergabe eines Events durch das DOM.
 *
 * - Nützlich, wenn bestimmte Klicks oder andere Events
 *   nicht von globalen oder übergeordneten Event-Handlern behandelt werden sollen.
 *
 * @function stopEventPropagation
 * @param {Event} event - Das Event, dessen Propagation gestoppt werden soll.
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
function stopEventPropagation(event) {
  event.stopPropagation();
}