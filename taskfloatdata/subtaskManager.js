import { getSubtaskHTML, getEditableSubtaskTemplate } from "./taskfloatHTML.js";
import { initInputField } from "../scripts/auth/Validation.js";
import { validateSubtaskBeforeSave } from "../addtask/formManager.js";

let subtaskItemsListModal = [];
let completedSubtasksModal = [];
let isSubtaskEditMode = false;
let currentEditIndex = -1;
let outsideClickHandlerBound = false;

/**
 * Returns the current subtask list (texts).
 * @returns {string[]} Array of subtask texts
 */
export function getSubtaskItems() {
  return subtaskItemsListModal;
}

/**
 * Returns the current list of completion flags.
 * @returns {boolean[]} Array of completion states (parallel to subtask list)
 */
export function getCompletedSubtasks() {
  return completedSubtasksModal;
}

/**
 * Sets the subtask list (texts).
 * @param {string[]} items - New subtask texts
 * @returns {void}
 */
export function setSubtaskItems(items) {
  subtaskItemsListModal = [...items];
}

/**
 * Sets the completion list.
 * @param {boolean[]} completed - Completion states (parallel to subtask list)
 * @returns {void}
 */
export function setCompletedSubtasks(completed) {
  completedSubtasksModal = [...completed];
}

/**
 * Resets all subtasks (texts and completion states).
 * @returns {void}
 */
export function resetSubtasks() {
  subtaskItemsListModal = [];
  completedSubtasksModal = [];
}

/**
 * Clears the input field for new subtasks (Modal).
 * @returns {void}
 * @private
 */
function clearSubtaskInput() {
  const subInput = document.getElementById("subtask-modal");
  if (subInput) subInput.value = "";
}

/**
 * Adds a new subtask via the plus button (modal).
 * Prevents form submit, validates, and then re-renders.
 * @param {Event} event - Click event
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
 * Adds a subtask on Enter key press in the input field (modal).
 * Prevents form submit.
 * @param {KeyboardEvent} event - Keydown event
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
 * Adds a subtask to the internal list and sets completion flag to false.
 * @param {string} value - Subtask text (trimmed)
 * @returns {void}
 * @private
 */
function addSubtaskToList(value) {
  subtaskItemsListModal.push(value);
  completedSubtasksModal.push(false);
}

/**
 * Renders all subtasks in the modal (including events).
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
 * Clears the subtask container list.
 * @param {HTMLElement} list - Container element
 * @returns {void}
 * @private
 */
function clearSubtaskList(list) {
  list.innerHTML = "";
}

/**
 * Clears the assigned user lists (modal and potentially main view).
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
 * Renders all subtask items in the container.
 * @param {HTMLElement} list - Container element
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
 * Builds the DOM element for a subtask.
 * @param {string} text - Subtask text
 * @param {number} index - Index of the subtask
 * @returns {HTMLElement} Subtask element
 * @private
 */
function createSubtaskElement(text, index) {
  const container = document.createElement("div");
  container.innerHTML = getSubtaskHTML(text, index);
  return container.firstElementChild;
}

/**
 * Binds all necessary event listeners to the list (Delete, Edit, Checkbox).
 * @param {HTMLElement} list - Container element
 * @returns {void}
 * @private
 */
function attachAllEventListeners(list) {
  attachDeleteListeners(list);
  attachEditListeners(list);
  attachCheckboxListeners(list);
}

/**
 * Binds delete button listener.
 * @param {HTMLElement} list - Container element
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
 * Deletes a subtask from the lists and re-renders.
 * @param {number} index - Index of the subtask to be deleted
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
 * Binds edit button listener and ensures that only one subtask is editable at a time.
 * @param {HTMLElement} list - Container element
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
 * Binds checkbox change listener for completion status.
 * @param {HTMLElement} list - Container element
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
 * Switches a subtask to edit mode.
 * @param {number} index - Index of the subtask
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
 * Delivers the DOM element of a subtask by index.
 * @param {number} index - Index of the subtask
 * @returns {HTMLElement|null} Subtask element or null
 * @private
 */
function getSubtaskElement(index) {
  const list = document.getElementById("subtaskList-modal");
  return list?.children[index] || null;
}

/**
 * Replaces a subtask element with the edit template.
 * @param {HTMLElement} item - DOM element to be replaced
 * @param {number} index - Index of the subtask
 * @returns {void}
 * @private
 */
function replaceWithEditTemplate(item, index) {
  const currentText = subtaskItemsListModal[index];
  item.innerHTML = getEditableSubtaskTemplate(currentText);
}

/**
 * Binds outside click to cleanly save/exit the current edit.
 * Only saves the current subtask (no form submit).
 * @param {HTMLElement} containerEl - Container of the editable subtask
 * @param {HTMLInputElement} inputEl - Edit input
 * @param {number} index - Index of the subtask
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
  setTimeout(() => document.addEventListener("click", onDocClick, true), 100);
  outsideClickHandlerBound = true;
  unbindOutsideClick = () => {
    document.removeEventListener("click", onDocClick, true);
    outsideClickHandlerBound = false;
    unbindOutsideClick = () => { };
  };
}

/**
 * Binds listener and key control in edit mode (Enter saves, Escape discards).
 * @param {HTMLElement} container - Container of the editable subtask
 * @param {number} index - Index of the subtask
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
 * Binds the save button in edit mode.
 * @param {HTMLElement|null} saveBtn - Save button
 * @param {HTMLInputElement|null} input - Edit input
 * @param {number} index - Index of the subtask
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
 * Saves the edited subtask (with validation) and exits edit mode.
 * @param {HTMLInputElement|null} input - Edit input
 * @param {number} index - Index of the subtask
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
 * Binds the delete button in edit mode.
 * @param {HTMLElement|null} deleteBtn - Delete button
 * @param {number} index - Index of the subtask
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
 * Updates the subtasks in the modal with external data.
 * @param {string[]} [subtasks=[]] - Subtask texts
 * @param {boolean[]} [subtaskDone=[]] - Completion states
 * @returns {void}
 */
export function updateSubtasks(subtasks = [], subtaskDone = []) {
  subtaskItemsListModal = [...subtasks];
  completedSubtasksModal = createCompletedArray(subtasks, subtaskDone);
}

/** Function to unbind the outside click handler (set dynamically). */
let unbindOutsideClick = () => { };

/**
 * Creates the completion list in correct length (fallback: false).
 * @param {string[]} subtasks - Subtask texts
 * @param {boolean[]} subtaskDone - Completion states
 * @returns {boolean[]} Completion list in subtask length
 * @private
 */
function createCompletedArray(subtasks, subtaskDone) {
  const hasValidDoneArray = subtaskDone.length === subtasks.length;
  return hasValidDoneArray ? [...subtaskDone] : new Array(subtasks.length).fill(false);
}

/**
 * Exits the edit mode, resets status, and unbinds outside click.
 * @returns {void}
 * @private
 */
function exitEditMode() {
  isSubtaskEditMode = false;
  currentEditIndex = -1;
  unbindOutsideClick();
}