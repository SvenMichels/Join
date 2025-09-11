import { getSubtaskHTML, getEditableSubtaskTemplate } from "./taskfloatHTML.js";
import { initInputField } from "../scripts/auth/Validation.js";
import { validateSubtaskBeforeSave } from "../addTask/formManager.js";

let subtaskItemsListModal = [];
let completedSubtasksModal = [];
let isSubtaskEditMode = false;
let currentEditIndex = -1;
let outsideClickHandlerBound = false;

/**
 * Gibt die aktuelle Subtaskliste (Texte) zurück.
 * @returns {string[]} Array der Subtask-Texte
 */
export function getSubtaskItems() {
  return subtaskItemsListModal;
}

/**
 * Gibt die aktuelle Liste der Erledigt-Flags zurück.
 * @returns {boolean[]} Array der Erledigt-Zustände (parallel zur Subtaskliste)
 */
export function getCompletedSubtasks() {
  return completedSubtasksModal;
}

/**
 * Setzt die Subtaskliste (Texte).
 * @param {string[]} items - Neue Subtask-Texte
 * @returns {void}
 */
export function setSubtaskItems(items) {
  subtaskItemsListModal = [...items];
}

/**
 * Setzt die Erledigt-Liste.
 * @param {boolean[]} completed - Erledigt-Zustände (parallel zur Subtaskliste)
 * @returns {void}
 */
export function setCompletedSubtasks(completed) {
  completedSubtasksModal = [...completed];
}

/**
 * Setzt alle Subtasks (Texte und Erledigt) zurück.
 * @returns {void}
 */
export function resetSubtasks() {
  subtaskItemsListModal = [];
  completedSubtasksModal = [];
}

/**
 * Löscht das Eingabefeld für neue Subtasks (Modal).
 * @returns {void}
 * @private
 */
function clearSubtaskInput() {
  const subInput = document.getElementById("subtask-modal");
  if (subInput) subInput.value = "";
}

/**
 * Fügt über den Plus-Button einen neuen Subtask hinzu (Modal).
 * Verhindert Formular-Submit, validiert und rendert anschließend neu.
 * @param {Event} event - Klick-Event
 * @returns {void}
 */
export function addSubtaskModal(event) {
  event.preventDefault();
  event.stopPropagation();
  const inputEl = document.getElementById("subtask-modal");
  if (!inputEl) return;
  if (!validateSubtaskBeforeSave(inputEl, "subtaskModalHint")) return;
  addSubtaskToList(inputEl.value.trim());
  clearSubtaskInput();
  renderSubtasksModal();
}

/**
 * Fügt bei Enter-Taste im Eingabefeld einen Subtask hinzu (Modal).
 * Verhindert Formular-Submit.
 * @param {KeyboardEvent} event - Keydown-Event
 * @returns {void}
 */
export function addSubtaskOnEnterModal(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    addSubtaskModal(event);
  }
}

/**
 * Fügt der internen Liste einen Subtask hinzu und setzt das Erledigt-Flag auf false.
 * @param {string} value - Subtask-Text (getrimmt)
 * @returns {void}
 * @private
 */
function addSubtaskToList(value) {
  subtaskItemsListModal.push(value);
  completedSubtasksModal.push(false);
}

/**
 * Rendert alle Subtasks im Modal (inkl. Events).
 * @returns {void}
 */
export function renderSubtasksModal() {
  const list = document.getElementById("subtaskList-modal");
  if (!list) return;

  clearSubtaskList(list);
  clearAssignedList();
  renderSubtaskItems(list);
  attachAllEventListeners(list);
}

/**
 * Leert die Subtask-Containerliste.
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function clearSubtaskList(list) {
  list.innerHTML = "";
}

/**
 * Leert die zugewiesenen User-Listen (Modal und evtl. Hauptansicht).
 * @returns {void}
 * @private
 */
function clearAssignedList() {
  const assignedListModal = document.getElementById("assignedList-modal");
  const assignedList = document.getElementById("assignedList");

  if (assignedList) {
    assignedList.innerHTML = "";
  }
  if (assignedListModal) {
    assignedListModal.innerHTML = "";
  }
}

/**
 * Rendert alle Subtask-Items in den Container.
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function renderSubtaskItems(list) {
  subtaskItemsListModal.forEach((text, index) => {
    const subtaskElement = createSubtaskElement(text, index);
    list.appendChild(subtaskElement);
  });
}

/**
 * Baut das DOM-Element für einen Subtask.
 * @param {string} text - Subtask-Text
 * @param {number} index - Index des Subtasks
 * @returns {HTMLElement} Subtask-Element
 * @private
 */
function createSubtaskElement(text, index) {
  const container = document.createElement("div");
  container.innerHTML = getSubtaskHTML(text, index);
  return container.firstElementChild;
}

/**
 * Bindet alle erforderlichen Event-Listener an die Liste (Delete, Edit, Checkbox).
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function attachAllEventListeners(list) {
  attachDeleteListeners(list);
  attachEditListeners(list);
  attachCheckboxListeners(list);
}

/**
 * Bindet Delete-Button-Listener.
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function attachDeleteListeners(list) {
  const deleteButtons = list.querySelectorAll("[data-del]");
  deleteButtons.forEach(button => {
    button.setAttribute("type", "button");
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(button.dataset.del);
      deleteSubtask(index);
    });
  });
}

/**
 * Löscht einen Subtask aus den Listen und rendert neu.
 * @param {number} index - Index des zu löschenden Subtasks
 * @returns {void}
 * @private
 */
function deleteSubtask(index) {
  subtaskItemsListModal.splice(index, 1);
  completedSubtasksModal.splice(index, 1);
  if (currentEditIndex === index) {
    isSubtaskEditMode = false;
    currentEditIndex = -1;
  }
  renderSubtasksModal();
}

/**
 * Bindet Edit-Button-Listener und stellt sicher, dass nur ein Subtask gleichzeitig editierbar ist.
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function attachEditListeners(list) {
  const editButtons = list.querySelectorAll("[data-edit]");
  editButtons.forEach(button => {
    button.setAttribute("type", "button");
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(button.dataset.edit);
      if (isSubtaskEditMode && currentEditIndex !== index) {
        isSubtaskEditMode = false;
        currentEditIndex = -1;
        unbindOutsideClick();
        renderSubtasksModal();
      }
      if (isSubtaskEditMode) return;
      makeSubtaskEditableModal(index);
    });
  });
}

/**
 * Bindet Checkbox-Change-Listener für Erledigt-Status.
 * @param {HTMLElement} list - Container-Element
 * @returns {void}
 * @private
 */
function attachCheckboxListeners(list) {
  const checkboxes = list.querySelectorAll(".subtask-checkbox-modal");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
      const index = parseInt(event.target.dataset.index);
      completedSubtasksModal[index] = event.target.checked;
    });
  });
}

/**
 * Wechselt einen Subtask in den Edit-Modus.
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function makeSubtaskEditableModal(index) {
  const item = getSubtaskElement(index);
  if (!item) return;
  isSubtaskEditMode = true;
  currentEditIndex = index;
  replaceWithEditTemplate(item, index);
  attachEditModeListeners(item, index);
  initInputField("subtaskEditModal", "subtaskEditModalHint", "subtask");
}

/**
 * Liefert das DOM-Element eines Subtasks per Index.
 * @param {number} index - Index des Subtasks
 * @returns {HTMLElement|null} Subtask-Element oder null
 * @private
 */
function getSubtaskElement(index) {
  const list = document.getElementById("subtaskList-modal");
  return list?.children[index] || null;
}

/**
 * Ersetzt ein Subtask-Element durch die Edit-Vorlage.
 * @param {HTMLElement} item - Zu ersetzendes DOM-Element
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function replaceWithEditTemplate(item, index) {
  const currentText = subtaskItemsListModal[index];
  item.innerHTML = getEditableSubtaskTemplate(currentText);
}

/**
 * Bindet Outside-Click, um den aktuellen Edit sauber zu speichern/verlassen.
 * Speichert nur den aktuellen Subtask (keinen Formular-Submit).
 * @param {HTMLElement} containerEl - Container des editierbaren Subtasks
 * @param {HTMLInputElement} inputEl - Edit-Input
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function bindOutsideClickToClose(containerEl, inputEl, index) {
  if (outsideClickHandlerBound) return;

  const onDocClick = (e) => {
    if (containerEl.contains(e.target)) return;

    const val = inputEl?.value?.trim() || "";
    if (val && validateSubtaskBeforeSave(inputEl, "subtaskEditModalHint")) {
      subtaskItemsListModal[index] = val;
    }

    exitEditMode();
    document.removeEventListener("click", onDocClick, true);
    outsideClickHandlerBound = false;
    renderSubtasksModal();
  };
  setTimeout(() => document.addEventListener("click", onDocClick, true), 0);
  outsideClickHandlerBound = true;
  unbindOutsideClick = () => {
    document.removeEventListener("click", onDocClick, true);
    outsideClickHandlerBound = false;
    unbindOutsideClick = () => {};
  };
}

/**
 * Bindet Listener und Tastensteuerung im Edit-Modus (Enter speichert, Escape verwirft).
 * @param {HTMLElement} container - Container des editierbaren Subtasks
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function attachEditModeListeners(container, index) {
  const input = container.querySelector("input");
  const saveBtn = container.querySelector("[data-save]");
  const deleteBtn = container.querySelector("[data-del]");
  if (saveBtn) saveBtn.setAttribute("type", "button");
  if (deleteBtn) deleteBtn.setAttribute("type", "button");
  attachSaveListener(saveBtn, input, index);
  attachDeleteListener(deleteBtn, index);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      saveSubtaskEdit(input, index);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      exitEditMode();
      renderSubtasksModal();
    }
  });
  bindOutsideClickToClose(container, input, index);
}

/**
 * Bindet den Save-Button im Edit-Modus.
 * @param {HTMLElement|null} saveBtn - Save-Button
 * @param {HTMLInputElement|null} input - Edit-Input
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function attachSaveListener(saveBtn, input, index) {
  if (!saveBtn) return;
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveSubtaskEdit(input, index);
  });
}

/**
 * Speichert den editierten Subtask (mit Validierung) und verlässt den Edit-Modus.
 * @param {HTMLInputElement|null} input - Edit-Input
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function saveSubtaskEdit(input, index) {
  if (!input) return;
  if (!validateSubtaskBeforeSave(input, "subtaskEditModalHint")) return;
  subtaskItemsListModal[index] = input.value.trim();
  exitEditMode();
  renderSubtasksModal();
}

/**
 * Bindet den Delete-Button im Edit-Modus.
 * @param {HTMLElement|null} deleteBtn - Delete-Button
 * @param {number} index - Index des Subtasks
 * @returns {void}
 * @private
 */
function attachDeleteListener(deleteBtn, index) {
  if (!deleteBtn) return;
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteSubtask(index);
  });
}

/**
 * Aktualisiert die Subtasks im Modal mit externen Daten.
 * @param {string[]} [subtasks=[]] - Subtask-Texte
 * @param {boolean[]} [subtaskDone=[]] - Erledigt-Zustände
 * @returns {void}
 */
export function updateSubtasks(subtasks = [], subtaskDone = []) {
  subtaskItemsListModal = [...subtasks];
  completedSubtasksModal = createCompletedArray(subtasks, subtaskDone);
}

/** Funktion zum Abhängen des Outside-Click-Handlers (wird dynamisch gesetzt). */
let unbindOutsideClick = () => {};

/**
 * Erzeugt die Erledigt-Liste in korrekter Länge (Fallback: false).
 * @param {string[]} subtasks - Subtask-Texte
 * @param {boolean[]} subtaskDone - Erledigt-Zustände
 * @returns {boolean[]} Erledigt-Liste in Subtask-Länge
 * @private
 */
function createCompletedArray(subtasks, subtaskDone) {
  const hasValidDoneArray = subtaskDone.length === subtasks.length;
  return hasValidDoneArray ? [...subtaskDone] : new Array(subtasks.length).fill(false);
}

/**
 * Verlässt den Edit-Modus, setzt Status zurück und hängt Outside-Click ab.
 * @returns {void}
 * @private
 */
function exitEditMode() {
  isSubtaskEditMode = false;
  currentEditIndex = -1;
  unbindOutsideClick();
}
