/**
 * @fileoverview Subtask management logic for the task modal, including creation, editing, deletion and rendering
 * @module subtaskModalManager
 */

import { getSubtaskHTML, getEditableSubtaskTemplate } from "./taskfloatHTML.js";

let subtaskItemsListModal = [];
let completedSubtasksModal = [];

/**
 * Returns the current subtask items
 * @returns {Array<string>} Array of subtask texts
 */
export function getSubtaskItems() {
  return subtaskItemsListModal;
}

/**
 * Returns the current completed subtasks
 * @returns {Array<boolean>} Array of completed statuses
 */
export function getCompletedSubtasks() {
  return completedSubtasksModal;
}

/**
 * Sets the list of subtask items
 * @param {Array<string>} items - Subtask item texts
 */
export function setSubtaskItems(items) {
  subtaskItemsListModal = [...items];
}

/**
 * Sets the list of completed subtasks
 * @param {Array<boolean>} completed - Completion status of each subtask
 */
export function setCompletedSubtasks(completed) {
  completedSubtasksModal = [...completed];
}

/**
 * Resets all subtasks
 */
export function resetSubtasks() {
  subtaskItemsListModal = [];
  completedSubtasksModal = [];
}

/**
 * Gets the trimmed value of the subtask input field
 * @returns {string} Input value
 */
function getSubtaskInputValue() {
  const subInput = document.getElementById("subtask-modal");
  return subInput?.value.trim() || "";
}

/**
 * Clears the subtask input field
 */
function clearSubtaskInput() {
  const subInput = document.getElementById("subtask-modal");
  if (subInput) subInput.value = "";
}

/**
 * Handles the add-subtask button click
 * @param {Event} event - Click event
 */
export function addSubtaskModal(event) {
  event.preventDefault();
  const value = getSubtaskInputValue();
  if (!value) return;

  addSubtaskToList(value);
  clearSubtaskInput();
  renderSubtasksModal();
}

/**
 * Adds a subtask and its initial completion state to the list
 * @param {string} value - Subtask text
 */
function addSubtaskToList(value) {
  subtaskItemsListModal.push(value);
  completedSubtasksModal.push(false);
}

/**
 * Handles Enter key press in the subtask input field
 * @param {KeyboardEvent} event - Key event
 */
export function addSubtaskOnEnterModal(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtaskModal(event);
  }
}

/**
 * Renders all subtasks in the modal list
 */
export function renderSubtasksModal() {
  const list = document.getElementById("subtaskList-modal");
  if (!list) return;

  clearSubtaskList(list);
  renderSubtaskItems(list);
  attachAllEventListeners(list);
}

/**
 * Clears the subtask list container
 * @param {HTMLElement} list - List DOM element
 */
function clearSubtaskList(list) {
  list.innerHTML = "";
}

/**
 * Renders all subtask items
 * @param {HTMLElement} list - List DOM element
 */
function renderSubtaskItems(list) {
  subtaskItemsListModal.forEach((text, index) => {
    const subtaskElement = createSubtaskElement(text, index);
    list.appendChild(subtaskElement);
  });
}

/**
 * Creates a DOM element for a subtask
 * @param {string} text - Subtask text
 * @param {number} index - Subtask index
 * @returns {HTMLElement} Subtask DOM element
 */
function createSubtaskElement(text, index) {
  const container = document.createElement("div");
  container.innerHTML = getSubtaskHTML(text, index);
  return container.firstElementChild;
}

/**
 * Attaches all necessary event listeners to the subtask list
 * @param {HTMLElement} list - List DOM element
 */
function attachAllEventListeners(list) {
  attachDeleteListeners(list);
  attachEditListeners(list);
  attachCheckboxListeners(list);
}

/**
 * Attaches delete button event listeners
 * @param {HTMLElement} list - List DOM element
 */
function attachDeleteListeners(list) {
  const deleteButtons = list.querySelectorAll("[data-del]");
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.dataset.del);
      deleteSubtask(index);
    });
  });
}

/**
 * Deletes a subtask from the list
 * @param {number} index - Index of the subtask to delete
 */
function deleteSubtask(index) {
  subtaskItemsListModal.splice(index, 1);
  completedSubtasksModal.splice(index, 1);
  renderSubtasksModal();
}

/**
 * Attaches edit button event listeners
 * @param {HTMLElement} list - List DOM element
 */
function attachEditListeners(list) {
  const editButtons = list.querySelectorAll("[data-edit]");
  editButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.dataset.edit);
      makeSubtaskEditableModal(index);
    });
  });
}

/**
 * Attaches checkbox change listeners
 * @param {HTMLElement} list - List DOM element
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
 * Converts a subtask to editable mode
 * @param {number} index - Subtask index
 */
function makeSubtaskEditableModal(index) {
  const item = getSubtaskElement(index);
  if (!item) return;

  replaceWithEditTemplate(item, index);
  attachEditModeListeners(item, index);
}

/**
 * Gets the DOM element of a subtask by index
 * @param {number} index - Index of the subtask
 * @returns {HTMLElement|null} Subtask element or null
 */
function getSubtaskElement(index) {
  const list = document.getElementById("subtaskList-modal");
  return list?.children[index] || null;
}

/**
 * Replaces the current subtask element with editable template
 * @param {HTMLElement} item - DOM element to replace
 * @param {number} index - Index of the subtask
 */
function replaceWithEditTemplate(item, index) {
  const currentText = subtaskItemsListModal[index];
  item.innerHTML = getEditableSubtaskTemplate(currentText);
}

/**
 * Attaches save and delete listeners to edit-mode subtask
 * @param {HTMLElement} container - Container DOM element
 * @param {number} index - Index of the subtask
 */
function attachEditModeListeners(container, index) {
  const input = container.querySelector("input");
  const saveBtn = container.querySelector("[data-save]");
  const deleteBtn = container.querySelector("[data-del]");

  attachSaveListener(saveBtn, input, index);
  attachDeleteListener(deleteBtn, index);
}

/**
 * Attaches save button event listener
 * @param {HTMLElement} saveBtn - Save button element
 * @param {HTMLInputElement} input - Input field element
 * @param {number} index - Index of the subtask
 */
function attachSaveListener(saveBtn, input, index) {
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    saveSubtaskEdit(input, index);
  });
}

/**
 * Saves edited subtask
 * @param {HTMLInputElement} input - Input field
 * @param {number} index - Index of the subtask
 */
function saveSubtaskEdit(input, index) {
  subtaskItemsListModal[index] = input.value.trim();
  renderSubtasksModal();
}

/**
 * Attaches delete button listener for edit mode
 * @param {HTMLElement} deleteBtn - Delete button element
 * @param {number} index - Index of the subtask
 */
function attachDeleteListener(deleteBtn, index) {
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", () => {
    deleteSubtask(index);
  });
}

/**
 * Updates the modal subtasks with external data
 * @param {Array<string>} subtasks - Array of subtask texts
 * @param {Array<boolean>} subtaskDone - Array of completion states
 */
export function updateSubtasks(subtasks = [], subtaskDone = []) {
  subtaskItemsListModal = [...subtasks];
  completedSubtasksModal = createCompletedArray(subtasks, subtaskDone);
}

/**
 * Ensures the completed state array matches the number of subtasks
 * @param {Array<string>} subtasks - Subtask texts
 * @param {Array<boolean>} subtaskDone - Completed states
 * @returns {Array<boolean>} Resulting boolean array
 */
function createCompletedArray(subtasks, subtaskDone) {
  const hasValidDoneArray = subtaskDone.length === subtasks.length;
  return hasValidDoneArray ? [...subtaskDone] : new Array(subtasks.length).fill(false);
}
