/**
 * Subtask Management for Add Task
 * Handles all logic related to adding, editing, and rendering subtasks.
 *
 * @module subtaskHandler
 */

import { getSubtaskControlGroupTemplate } from "./addtasktemplates.js";
import { getSubtaskItems, addSubtaskItem, removeSubtaskItem, updateSubtaskItem, validateSubtaskBeforeSave, setSubtaskItems } from "./formManager.js";
import { initInputField } from "../scripts/auth/Validation.js";


let outsideClickHandlerBound = false;


/**
 * Handles adding a new subtask via button click.
 *
 * @param {Event} element - Click event.
 */
export function addNewSubtask(element) {
  element.preventDefault();
  const input = document.getElementById("subtask");
  if (!input) return;
  if (!validateSubtaskBeforeSave(input, "subtaskHint")) return;
  addSubtaskItem(input.value.trim());
  input.value = "";
  renderSubtasks();
}

/**
 * Adds a subtask when the Enter key is pressed.
 *
 * @param {KeyboardEvent} element - Keydown event.
 */
export function addSubtaskOnEnterKey(element) {
  if (element.key === "Enter") {
    element.preventDefault();
    addNewSubtask(element);
  }
}

/**
 * Renders all subtasks currently in memory to the DOM.
 */
export function renderSubtasks() {
  const list = document.getElementById("subtaskList");
  if (!list) return;

  list.innerHTML = "";
  const subtasks = getSubtaskItems();

  subtasks.forEach((text, index) => {
    const container = createSubtaskContainer(text, index);
    list.appendChild(container);
  });
}

/**
 * Creates a subtask DOM container with text and controls.
 *
 * @param {string} text - The text of the subtask.
 * @param {number} index - Index of the subtask.
 * @returns {HTMLElement} The container element.
 */
function createSubtaskContainer(text, index) {
  const container = document.createElement("div");
  container.className = "subtask-container";

  const textElement = createTextElement(text, index);
  const controlGroup = createControlGroup(index);

  container.append(textElement, controlGroup);
  return container;
}

/**
 * Creates a span element to display the subtask text.
 *
 * @param {string} text - Subtask text.
 * @param {number} index - Subtask index.
 * @returns {HTMLElement} Span element.
 */
function createTextElement(text, index) {
  const span = document.createElement("span");
  span.className = "subtask-display-text";
  span.textContent = text;
  span.addEventListener("click", () => makeSubtaskEditable(index));
  return span;
}

/**
 * Creates the control button group for a subtask.
 *
 * @param {number} index - Subtask index.
 * @returns {HTMLElement} Wrapper element with buttons.
 */
function createControlGroup(index) {
  const wrapper = document.createElement("div");
  wrapper.className = "subtask-controls";
  wrapper.innerHTML = getSubtaskControlGroupTemplate();
  const [editBtn, , deleteBtn] = wrapper.children;
  addControlListeners(editBtn, deleteBtn, index);
  return wrapper;
}

/**
 * Binds edit and delete functionality to buttons.
 *
 * @param {HTMLElement} editBtn - The edit button.
 * @param {HTMLElement} deleteBtn - The delete button.
 * @param {number} index - Subtask index.
*/
let isSubtaskEditMode = false;

function addControlListeners(editBtn, deleteBtn, index) {
  editBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isSubtaskEditMode) return;
    isSubtaskEditMode = true;
    makeSubtaskEditable(index);
  });
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    removeSubtaskItem(index);
    renderSubtasks();
  });
  exitEditMode();
}

function exitEditMode() {
  isSubtaskEditMode = false;
}

/**
 * Turns the static subtask text into an editable input field.
 *
 * @param {number} index - Subtask index.
 */
function makeSubtaskEditable(index) {
  const list = document.getElementById("subtaskList");
  const container = list.children[index];
  if (!container) return;
  const subtasks = getSubtaskItems();
  container.innerHTML = "";
  const counter = crypto.randomUUID();
  const input = createSubtaskInput(subtasks[index], counter);
  const buttonGroup = createSubtaskButtons(index, input);
  container.append(input, buttonGroup);
  initInputField(`subtaskEdit-${counter}`, "subtaskEditHint", "subtask");
  bindOutsideClickToClose(container);
}

export function bindOutsideClickToClose(containerEl) {
  if (outsideClickHandlerBound) return;
  const onDocClick = (e) => {
    if (containerEl.contains(e.target)) return;
    const input = containerEl.querySelector('.subtask-text-input') || containerEl.querySelector('input');
    if (input) {
      updateSubtaskItem(containerEl, input.value.trim());
      renderSubtasks();
    }
    isSubtaskEditMode = false;
    document.removeEventListener('click', onDocClick);
    outsideClickHandlerBound = false;
  };
  setTimeout(() => document.addEventListener('click', onDocClick), 0);
  outsideClickHandlerBound = true;
}
/**
 * Creates an input element pre-filled with the subtask text.
 *
 * @param {string} value - Text value of the subtask.
 * @returns {HTMLInputElement} Input element.
 */
function createSubtaskInput(value, counter) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.className = "subtask-text-input";
  input.id = `subtaskEdit-${counter}`;
  return input;
}

/**
 * Creates a wrapper with save and delete buttons for editing mode.
 *
 * @param {number} index - Subtask index.
 * @param {HTMLInputElement} input - Input element with subtask value.
 * @returns {HTMLElement} Wrapper element with action buttons.
 */
function createSubtaskButtons(index, input) {
  const wrapper = createElement("div", "subtask-button-wrapper");
  const spacer = createElement("div", "subtask-spacer");
  const saveBtn = createIconButton("check.svg", "subtask-save-button", () => {
    if (!validateSubtaskBeforeSave(input, "subtaskEditHint")) return;
    updateSubtaskItem(index, input.value.trim());
    renderSubtasks();
  });
  const deleteBtn = createIconButton("delete.svg", "subtask-delete-button", () => {
    removeSubtaskItem(index);
    renderSubtasks();
  });
  wrapper.append(deleteBtn, spacer, saveBtn);
  return wrapper;
}

/**
 * Creates an HTML element with the given tag and class.
 *
 * @param {string} tag - HTML tag name.
 * @param {string} className - CSS class to apply.
 * @returns {HTMLElement} The created element.
 */
function createElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

/**
 * Creates a button element containing an icon and a click handler.
 *
 * @param {string} icon - Filename of the icon (e.g. 'delete.svg').
 * @param {string} className - CSS class for the button.
 * @param {Function} onClick - Click event handler.
 * @returns {HTMLButtonElement} The constructed button element.
 */
function createIconButton(icon, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.innerHTML = `<img src="../assets/icons/${icon}" alt="${className}">`;
  btn.addEventListener("click", onClick);
  return btn;
}
