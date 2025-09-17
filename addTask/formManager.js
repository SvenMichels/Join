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

export function initCategoryDropdown(categoryWrapperSelector, categorySelectSelector, categoryOptionsSelector, taskTitleSelector, taskDateSelector) {
  const categoryWrapper = document.querySelector(categoryWrapperSelector);
  const categorySelect = document.querySelector(categorySelectSelector);
  const categoryOptions = document.querySelector(categoryOptionsSelector);

  toggleCategoryDropdown(categoryOptions, categoryWrapper);
  closeCategoryDropdown(categoryOptions, categoryWrapper);

  categorySelect.addEventListener("click", () => {
    toggleCategoryDropdown(categoryOptions, categoryWrapper);
  });

  categoryOptions.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
      categorySelect.textContent = option.textContent;
      categorySelect.dataset.selected = option.dataset.value;
      const titleElement = document.getElementById(taskTitleSelector);
      const dateElement = document.getElementById(taskDateSelector);
      const titleElementValue = titleElement.value;
      const dateElementValue = dateElement.value;

      if (categorySelect && titleElementValue.length > 3 && dateElementValue.length > 0) {
        const btn = document.querySelector(".create-button");
        btn.disabled = false;
      } else {
        const btn = document.querySelector(".create-button");
        btn.disabled = true;
      }
      closeCategoryDropdown(categoryOptions, categoryWrapper);
    });
  });

  document.addEventListener("click", (e) => {
    if (!categoryWrapper.contains(e.target)) {
      closeCategoryDropdown(categoryOptions, categoryWrapper);
    }
  });
}

function toggleCategoryDropdown(categoryOptions, categoryWrapper) {
  const isOpen = categoryOptions.classList.toggle("open");
  categoryWrapper.classList.toggle("expanded", isOpen);
}



function closeCategoryDropdown(categoryOptions, categoryWrapper) {
  categoryOptions.classList.remove("open");
  categoryWrapper.classList.remove("expanded");
}