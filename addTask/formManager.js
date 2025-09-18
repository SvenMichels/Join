import { showValidateBubble, setFieldValidity } from "../scripts/auth/Validation.js";
import { getSubtaskMessage } from "../scripts/auth/validationsmessages.js";

/**
 * Add Task Form Management
 * Provides functions and state management for the Add Task form.
 *
 * @module formManager
 */

/** @type {string} */
export let currentlySelectedPriority = "medium";

/** @type {string[]} */
export let subtaskItemsList = [];

const isSubtaskEditMode = false;

/**
 * Gets the currently selected task priority.
 * @returns {string} The currently selected priority.
 */
export function getCurrentPriority() {
  return currentlySelectedPriority;
}

/**
 * Sets the current task priority.
 * @param {string} priority - The new priority to set.
 */
export function setCurrentPriority(priority) {
  currentlySelectedPriority = priority;
}

/**
 * Retrieves the current list of subtask items.
 * @returns {string[]} List of subtasks.
 */
export function getSubtaskItems() {
  return subtaskItemsList;
}

/**
 * Sets the subtask items list.
 * @param {string[]} items - An array of subtask strings.
 */
export function setSubtaskItems(items) {
  subtaskItemsList = [...items];
}

/**
 * Adds a subtask item to the list.
 * @param {string} item - A new subtask string.
 */
export function addSubtaskItem(item) {
  subtaskItemsList.push(item);
}

export function validateSubtaskBeforeSave(inputElment, bubbleId) {
  const input = inputElment?.value ?? "";
  const value = input.trim();
  const msg = getSubtaskMessage(value);
  if (msg !== "Looks good!") {
    showValidateBubble(inputElment.id, msg, bubbleId, 2000);
    setFieldValidity(inputElment.id, false);
    return false;
  }
  setFieldValidity(inputElment.id, true);
  return true;
}

/**
 * Removes a subtask item at a specific index.
 * @param {number} index - The index of the subtask to remove.
 */
export function removeSubtaskItem(index) {
  subtaskItemsList.splice(index, 1);
}

/**
 * Updates the value of a subtask at a given index.
 * @param {number} index - Index of the subtask to update.
 * @param {string} newValue - New value for the subtask.
 */
export function updateSubtaskItem(index, newValue) {
  subtaskItemsList[index] = newValue;
}

/**
 * Resets the form state including priority and subtasks.
 */
export function resetFormState() {
  currentlySelectedPriority = "medium";
  subtaskItemsList = [];
}

/**
 * Collects and returns all form data in a structured object.
 * 
 * @param {HTMLFormElement} form - The form element to extract data from.
 * @returns {Object} Task data object.
 */
export function collectTaskData(form) {
  console.log(form);

  const id = form.getAttribute("data-task-id");
  const title = form.taskTitle.value.trim();
  const description = form.taskDescription.value.trim();
  const dueDate = form.taskDate.value;
  const category = document.getElementById("categorySelect").dataset.selected;
  const prio = currentlySelectedPriority;
  const assignedUsers = collectAssignedUsers();
  const subtasks = [...subtaskItemsList];
  const subtaskDone = Array(subtaskItemsList.length).fill(false);

  return {
    ...(id && { id }),
    title,
    description,
    dueDate,
    category,
    prio,
    assignedUsers,
    subtasks,
    subtaskDone,
    status: "todo",
  };
}

/**
 * Validates task data to ensure required fields are present.
 *
 * @param {Object} task - Task object to validate.
 * @returns {boolean} True if valid, false if validation failed.
 */
export function validateTask(task) {
  let isValid = true;
  const show = (id, condition) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.display = condition ? "inline" : "none";
    if (condition) isValid = false;
  };

  show("titleAlert", !task.title);
  show("dateAlert", !task.dueDate);
  show("categoryAlert", !task.category);

  return isValid;
}

/**
 * Collects currently selected users from the checkbox list.
 * 
 * @returns {string[]} Array of user full names.
 */
export function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map((cb) => cb.value);
}

/**
 * Clears all validation alert messages in the form.
 */
export function clearValidationAlerts() {
  const alertElementIds = ["titleAlert", "dateAlert", "categoryAlert"];
  alertElementIds.forEach(alertId => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) alertElement.style.display = "none";
  });
}

/**
 * Gets the subtasks formatted for payload submission.
 * 
 * @returns {string[]} Array of trimmed subtask strings.
 */
export function getSubtasksForPayload() {
  const items = getSubtaskItems();
  return (items || []).map(s => (s || "").trim()).filter(Boolean);
}
// ".prio-category-container", "#categorySelect", "#categoryOptions", "task-title", "task-date"
export function initCategoryDropdown(wrapperElementId) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;
  if (wrapper.id === "form-wrapper") {
    const elements = getElementConfigsForAddTask();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
  }
  if (wrapper.id === "formWrapper") {
    const elements = getElementConfigsForAddTaskModal();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
  }
}

function getElementConfigsForAddTaskModal() {
  const wrapper = document.querySelector("#formWrapper");
  const select = document.querySelector("#category-modal");
  const options = document.querySelector("#categoryOptions-modal");
  const titleInput = document.querySelector("#task-title-modal");
  const dateInput = document.querySelector("#task-date-modal");
  const createButton = document.querySelector(".create-button");
  console.log({ wrapper, select, options, titleInput, dateInput, createButton });

  return { wrapper, select, options, titleInput, dateInput, createButton };
}

function getElementConfigsForAddTask() {
  const wrapper = document.querySelector(".form-wrapper");
  const select = document.querySelector("#categorySelect");
  const options = document.querySelector("#categoryOptions");
  const titleInput = document.querySelector("#task-title");
  const dateInput = document.querySelector("#task-date");
  const createButton = document.querySelector(".create-button");
  console.log({ wrapper, select, options, titleInput, dateInput, createButton });
  return { wrapper, select, options, titleInput, dateInput, createButton };
}

function attachCoreEvents({ wrapper, select, options, titleInput, dateInput, createButton }) {
  select.addEventListener("click", () => toggleDropdown(options, select));
  options.addEventListener("click", (event) =>
    handleOptionClick(event, select, options, wrapper, { titleInput, dateInput, createButton })
  );
  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) closeDropdown(options, wrapper);
  });
  [titleInput, dateInput].forEach((input) =>
    input.addEventListener("input", () => updateCreateButtonState({ select, titleInput, dateInput, createButton }))
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDropdown(options, wrapper);
  });
}

function handleOptionClick(event, select, options, wrapper, deps) {
  const clicked = event.target.closest("li");
  if (!clicked) return;
  select.textContent = clicked.textContent.trim();
  select.dataset.selected = clicked.dataset.value || clicked.textContent.trim();
  updateCreateButtonState({ select, ...deps });
  closeDropdown(options, wrapper);
}

function updateCreateButtonState({ select, titleInput, dateInput, createButton }) {
  const valid = isFormValid({ select, titleInput, dateInput });
  createButton.disabled = !valid;
}

function isFormValid({ select, titleInput, dateInput }) {
  const hasCategory = Boolean(select.dataset.selected);
  const hasTitle = titleInput.value.trim().length > 3;
  const hasDate = Boolean(dateInput.value.trim());
  return hasCategory && hasTitle && hasDate;
}

function toggleDropdown(options, wrapper) {
  const isOpen = options.classList.toggle("open");
  wrapper.classList.toggle("expanded", isOpen);

  options.querySelectorAll("li").forEach((li) => {
    li.classList.toggle("expanded", isOpen);
  });
}

function closeDropdown(options, wrapper) {
  options.classList.remove("open");
  wrapper.classList.remove("expanded");

  options.querySelectorAll("li").forEach((li) => {
    li.classList.remove("expanded");
  });
}

function query(selectorOrElement) {
  return typeof selectorOrElement === "string" ? document.querySelector(selectorOrElement) : selectorOrElement;
}