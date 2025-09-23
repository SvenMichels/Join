import { showValidateBubble, setFieldValidity } from "../scripts/auth/Validation.js";
import { getSubtaskMessage } from "../scripts/auth/validationsmessages.js";

import { loadAndRenderUsers } from "./userAssignmentHandler.js";
import { loadContactData } from "../taskfloatdata/userAssignmentManager.js";

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
  if (!priority) priority = "medium";
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

/**
 * Validates a subtask input field before saving.
 * Shows a temporary validation bubble if invalid.
 * @param {HTMLInputElement} inputElment - The subtask input element.
 * @param {string} bubbleId - The id of the bubble container element.
 * @returns {boolean} True if the subtask value is valid; otherwise false.
 */
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

/**
 * Ensures user data is loaded when the assigned users dropdown is visible.
 * @param {HTMLElement} options - The dropdown options container element.
 */
export function ensureUsersIfVisible(options) {
  const isAssignedList =
    options?.id === "assignedUserList" || options?.id === "assignedUserList-modal";
  if (isAssignedList && options.classList.contains("visible")) {
    ensureAssignedUsersLoaded(options);
  }
}

/**
 * Lazily loads assigned users only once per dropdown element.
 * @param {HTMLElement} optionsEl - The assigned user list element (normal or modal).
 * @returns {Promise<void>}
 */
export async function ensureAssignedUsersLoaded(optionsEl) {
  if (!optionsEl) return;
  if (optionsEl.id === "assignedUserList" && optionsEl.dataset.usersLoaded !== "true") {
    await loadAndRenderUsers();
    optionsEl.dataset.usersLoaded = "true";
  }
  if (optionsEl.id === "assignedUserList-modal" && optionsEl.dataset.usersLoaded !== "true") {
    await loadContactData();
    optionsEl.dataset.usersLoaded = "true";
  }
}

/**
 * Handles a click on a generic dropdown option (excludes assigned users list).
 * Sets selected value, updates button state, and closes the dropdown.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} select - The visible select element showing the picked value.
 * @param {HTMLElement} options - The options container.
 * @param {HTMLElement} wrapper - Wrapper used for styling / expansion.
 * @param {Object} deps - Additional dependencies (titleInput, dateInput, createButton, etc.).
 * @param {HTMLElement} arrow - The arrow icon element.
 * @param {HTMLElement} prioContainer - Priority container (currently not used directly).
 */
export function handleOptionClick(event, select, options, wrapper, deps, arrow, prioContainer) {
  if (options && options.id === "assignedUserList") {
    return;
  }
  const clicked = event.target.closest("li") || event.target.closest("div");
  if (!clicked) return;
  select.textContent = clicked.textContent.trim();
  select.dataset.selected = clicked.dataset.value || clicked.textContent.trim();
  updateCreateButtonState({ select, ...deps });
  closeDropdown(options, wrapper, arrow);
}

/**
 * Enables or disables the create button based on current form validity.
 * @param {Object} ctx - Context object.
 * @param {HTMLElement} ctx.select - Category select element.
 * @param {HTMLInputElement} ctx.titleInput - Title input field.
 * @param {HTMLInputElement} ctx.dateInput - Due date input field.
 * @param {HTMLElement} ctx.prioContainer - Priority container element.
 * @param {HTMLButtonElement} ctx.createButton - The submit/create button.
 */
export function updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton }) {
  const valid = isFormValid({ select, titleInput, dateInput, prioContainer });
  createButton.disabled = !valid;
}

/**
 * Checks whether the minimal required form fields are valid.
 * @param {Object} params - Parameter bundle.
 * @param {HTMLElement} params.select - Category select element (dataset.selected required).
 * @param {HTMLInputElement} params.titleInput - Title input field.
 * @param {HTMLInputElement} params.dateInput - Date input field.
 * @returns {boolean} True if form is valid.
 */
export function isFormValid({ select, titleInput, dateInput }) {
  const hasCategory = Boolean(select.dataset.selected);
  const hasTitle = titleInput.value.trim().length > 3;
  const hasDate = Boolean(dateInput.value.trim());
  return hasCategory && hasTitle && hasDate;
}

/**
 * Determines whether an element is currently considered "open".
 * @param {HTMLElement|null} el - Element to test.
 * @returns {boolean} True if element has open/visible state.
 */
const isOpenEl = (el) => !!el && (el.classList.contains("open") || el.classList.contains("visible"));

/**
 * Checks if an id refers to a category options dropdown.
 * @param {string} id - Element id.
 * @returns {boolean} True if category options id.
 */
const isCategoryId = (id) => id === "categoryOptions" || id === "categoryOptions-modal";

/**
 * Checks if an id refers to an assigned user list dropdown.
 * @param {string} id - Element id.
 * @returns {boolean} True if assigned user list id.
 */
const isAssignedId = (id) => id === "assignedUserList" || id === "assignedUserList-modal";

/**
 * Resolves assigned users dropdown related elements based on context.
 * @param {string} idRef - Id indicating normal or modal context.
 * @returns {{list: HTMLElement|null, wrapper: HTMLElement|null, arrow: HTMLElement|null}}
 */
function getAssignedFrom(idRef) {
  const modal = idRef.includes("modal");
  return {
    list: document.getElementById(modal ? "assignedUserList-modal" : "assignedUserList"),
    wrapper: document.querySelector(".assigned-input-wrapper"),
    arrow: document.getElementById(modal ? "assignedBtnImg-modal" : "assignedBtnImg"),
  };
}

/**
 * Resolves category dropdown related elements based on context.
 * @param {string} idRef - Id indicating normal or modal context.
 * @returns {{list: HTMLElement|null, select: HTMLElement|null, wrapper: HTMLElement|null, arrow: HTMLElement|null}}
 */
function getCategoryFrom(idRef) {
  const modal = idRef.includes("modal");
  const select = document.getElementById(modal ? "category-modal" : "categorySelect");
  return {
    list: document.getElementById(modal ? "categoryOptions-modal" : "categoryOptions"),
    select,
    wrapper: select?.parentElement,
    arrow: document.getElementById(modal ? "categoryBtnImg-modal" : "categoryBtnImg"),
  };
}

/**
 * Closes assigned users dropdown if currently open.
 * @param {string} idRef - Context id.
 */
function closeAssignedIfOpen(idRef) {
  const { list, wrapper, arrow } = getAssignedFrom(idRef);
  if (isOpenEl(list)) closeDropdown(list, wrapper, arrow);
}

/**
 * Closes category dropdown if currently open.
 * @param {string} idRef - Context id.
 */
function closeCategoryIfOpen(idRef) {
  const { list, wrapper, arrow } = getCategoryFrom(idRef);
  if (isOpenEl(list)) closeDropdown(list, wrapper, arrow);
}

/**
 * Ensures only one dropdown group (category vs assigned) remains open.
 * @param {HTMLElement} options - The options container interacted with.
 */
function ensureOthersClosed(options) {
  const id = options.id;
  if (isCategoryId(id)) {
    closeAssignedIfOpen(id);
  } else if (isAssignedId(id)) {
    closeCategoryIfOpen(id);
  }
}

/**
 * Toggles dropdown state classes and returns new open state.
 * @param {HTMLElement} options - Options list element.
 * @param {HTMLElement} wrapper - Wrapper element for styling.
 * @param {HTMLElement} arrow - Arrow icon element.
 * @returns {boolean} True if now open.
 */
function applyToggle(options, wrapper, arrow) {
  const isOpen = options.classList.toggle("open");
  options.classList.toggle("visible", isOpen);
  arrow?.classList.toggle("rotated", isOpen);
  wrapper?.classList.toggle("expanded", isOpen);
  return isOpen;
}

/**
 * Lazily loads user data depending on dropdown id (normal vs modal).
 * @param {HTMLElement} options - Options list element.
 * @returns {Promise<void>}
 */
async function lazyLoadUsers(options) {
  const userLoadMap = {
    "assignedUserList": loadAndRenderUsers,
    "assignedUserList-modal": loadContactData,
  };
  const loader = userLoadMap[options.id];
  if (loader && !options.dataset.usersLoaded) {
    await loader();
    options.dataset.userLoaded = "true";
  }
}

/**
 * Toggles a dropdown (category or assigned), ensures exclusivity, lazy loads users when needed.
 * @param {HTMLElement} options - Options list element.
 * @param {HTMLElement} wrapper - Wrapper element.
 * @param {HTMLElement} arrow - Arrow icon.
 * @returns {Promise<void>}
 */
export async function toggleDropdown(options, wrapper, arrow) {
  if (!options) return;

  ensureOthersClosed(options);

  const isOpen = applyToggle(options, wrapper, arrow);

  subtaskExpander(isOpen, options);

  if (!isOpen) return;
  await lazyLoadUsers(options);
}

/**
 * Closes a specific dropdown or all open dropdowns if none provided.
 * @param {HTMLElement} [options] - Specific options element to close.
 * @param {HTMLElement} [wrapper] - Related wrapper element.
 * @param {HTMLElement} [arrow] - Related arrow element.
 * @param {HTMLElement} [options] - Specific options element to close.
 */
export function closeDropdown(options, wrapper, arrow) {
  if (!options) {
    removeClasses(".open", "open", "visible");
    removeClasses(".expanded", "expanded");
    resetArrowsById(ARROW_IDS);
    return;
  }

  options.classList.remove("open", "visible");
  wrapper?.classList.remove("expanded");

  if (arrow) {
    arrow.classList.remove("rotated");
  } else {
    resetArrowsBySelectors(ARROW_IDS.map((id) => `#${id}`));
  }

  if (options.id === "categoryOptions" || options.id === "categoryOptions-modal") {
    subtaskExpander(false, options);
  }
}

/**
 * Adds or removes an additional margin class to the priority/subtask container
 * when the category dropdown is expanded to prevent layout shift.
 * @param {boolean} isOpen - Whether the dropdown is open.
 * @param {HTMLElement} options - Options element triggering the expansion.
 */
export function subtaskExpander(isOpen, options) {
  const subContainer = document.querySelector(".prio-subtask-container");
  if (!subContainer) return;

  const shouldExpand = isOpen &&
    (options.id === "categoryOptions" || options.id === "categoryOptions-modal");

  subContainer.classList.toggle("container-margin", shouldExpand);
}

/**
 * Removes provided classes from all nodes matching the selector.
 * @param {string} selector - CSS selector.
 * @param {...string} classes - Class names to remove.
 */
function removeClasses(selector, ...classes) {
  document.querySelectorAll(selector).forEach((el) => el.classList.remove(...classes));
}

/**
 * Removes 'rotated' class from all arrow elements by id list.
 * @param {string[]} ids - Array of element ids.
 */
function resetArrowsById(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("rotated");
  });
}

/**
 * Removes 'rotated' class from elements resolved by given selectors.
 * @param {string[]} selectors - CSS selectors.
 */
function resetArrowsBySelectors(selectors) {
  selectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.classList.remove("rotated");
  });
}