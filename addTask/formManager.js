import { showValidateBubble, setFieldValidity } from "../scripts/auth/Validation.js";
import { getSubtaskMessage } from "../scripts/auth/validationsmessages.js";
import { categorySave } from "../board/boardUtils.js";
import { loadAndRenderUsers, updateSelectedUserDisplay, setupUserSearch, clearSelectedUserNamesHandler } from "./userAssignmentHandler.js";
import { selectPriorityModal, addActiveClass, setActiveIcon } from "../taskFloatData/priorityManager.js";

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
  const id = form.getAttribute("data-task-id");
  const title = form.taskTitle.value.trim();
  const description = form.taskDescription.value.trim();
  const dueDate = form.taskDate.value;
  const categoryElement = document.getElementById("categorySelect").innerHTML;
  const category = categorySave(categoryElement);
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

export function initFormAndButtonHandlers(wrapperElementId) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;

  if (wrapper.id === "form-wrapper") {
    const elements = getElementConfigsForAddTask();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
  } else if (wrapper.id === "formWrapper") {
    const elements = getElementConfigsForAddTaskModal();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
  } else if (wrapper.id === "assignedUserList" || wrapper.id === "assignedUserList-modal") {
    const elements = getElementConfigsForAssignedTo();
    ensureAssignedUsersLoaded(elements.options);
    attachCoreEvents(elements);
  }
}

// setupOutsideClickToClose("assignedUserList-modal",".assigned-input-wrapper","#assignedBtnImg-modal","#searchUser-modal") () => loadContactData()

// setupOutsideClickToClose("assignedUserList", ".assigned-input-wrapper", "assignedBtnImg", "#searchUser", () => loadAndRenderUsers());

export function getElementConfigsForAssignedTo() {
  const wrapper = document.querySelector(".assigned-input-wrapper");
  const options = document.getElementById("assignedUserList");
  const arrow = document.getElementById("assignedBtnImg");
  const select = document.getElementById("searchUser");
  const titleInput = document.getElementById("task-title");
  const dateInput = document.getElementById("task-date");
  const createButton = document.querySelector(".create-button");
  const prioContainer = document.querySelector(".prio-category-container");
  const clearBtn = document.getElementById("clearBtn");
  return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

export function getElementConfigsForAssignedToModal() {
  const wrapper = document.getElementById(".assigned-input-wrapper");
  const options = document.getElementById("assignedUserList-modal");
  const arrow = document.getElementById("#assignedBtnImg-modal");
  const select = document.querySelector("#searchUser-modal");
  const titleInput = document.querySelector("#task-title-modal");
  const dateInput = document.querySelector("#task-date-modal");
  const createButton = document.querySelector(".create-button");
  const prioContainer = document.querySelector(".prio-category-container");
  const clearBtn = document.getElementById("clearBtn");
  return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

function getElementConfigsForAddTaskModal() {
  const wrapper = document.querySelector("#formWrapper");
  const select = document.querySelector("#category-modal");
  const options = document.querySelector("#categoryOptions-modal");
  const titleInput = document.querySelector("#task-title-modal");
  const dateInput = document.querySelector("#task-date-modal");
  const createButton = document.querySelector(".create-button");
  const arrow = document.querySelector("#categoryBtnImg-modal");
  const prioContainer = document.querySelector(".prio-category-container");
  const clearBtn = document.getElementById("clearBtn");
  return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

function getElementConfigsForAddTask() {
  const wrapper = document.querySelector(".form-wrapper");
  const select = document.querySelector("#categorySelect");
  const options = document.querySelector("#categoryOptions");
  const titleInput = document.querySelector("#task-title");
  const dateInput = document.querySelector("#task-date");
  const createButton = document.querySelector(".create-button");
  const arrow = document.getElementById("categoryBtnImg");
  const prioContainer = document.querySelector(".prio-category-container");
  const clearBtn = document.getElementById("clearBtn");
  return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

function attachCoreEvents({ wrapper, select, options, titleInput, dateInput, createButton, arrow, prioContainer, clearBtn }) {
  clearBtn?.addEventListener("click", () => clearFormState(wrapper, select, options, titleInput, dateInput));

  arrow?.addEventListener("click", async () => {
    await ensureAssignedUsersLoaded(options);
    toggleDropdown(options, wrapper, arrow, prioContainer);
  });

  select?.addEventListener("click", async () => {
    await ensureAssignedUsersLoaded(options);
    toggleDropdown(options, wrapper, arrow, prioContainer);
  });

  options?.addEventListener("click", (event) =>
    handleOptionClick(event, select, options, wrapper, { titleInput, dateInput, createButton }, arrow, prioContainer)
  );

  setupUserSearch();
  clickOutsideToClose({ wrapper, select, options, arrow, prioContainer });
  if (titleInput && dateInput && createButton && prioContainer && select) {
    [titleInput, dateInput].forEach((input) =>
      (input).addEventListener("input", () => updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton }))
    );
    console.log(select);

    if (select) {
      select.addEventListener("change", () => updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton }));
    }
    // dateInput.addEventListener("mousedown", (e) => {
    //   e.preventDefault();
    //   dateInput.showPicker?.();
    // });
  }
  if (options?.id === "assignedUserList" && options.classList.contains("visible")) {
    ensureAssignedUsersLoaded(options);
  }

  return { wrapper, select, options, titleInput, dateInput, createButton };
}

async function ensureAssignedUsersLoaded(optionsEl) {
  if (!optionsEl) return;
  if (optionsEl.id === "assignedUserList" && optionsEl.dataset.usersLoaded !== "true") {
    await loadAndRenderUsers();
    optionsEl.dataset.usersLoaded = "true";
  }
}

function handleOptionClick(event, select, options, wrapper, deps, arrow, prioContainer) {
  const clicked = event.target.closest("li") || event.target.closest("div");
  if (!clicked) return;
  select.textContent = clicked.textContent.trim();
  select.dataset.selected = clicked.dataset.value || clicked.textContent.trim();
  updateCreateButtonState({ select, ...deps });
  closeDropdown(options, wrapper, arrow, prioContainer);
}

function updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton }) {
  console.log({ select, titleInput, dateInput, prioContainer, createButton });

  const valid = isFormValid({ select, titleInput, dateInput, prioContainer });
  createButton.disabled = !valid;
}

function clearFormState(wrapper, select, options, titleInput, dateInput) {
  if (select) {
    select.textContent = "Select a category";
    select.dataset.selected = "";
  }
  if (wrapper) wrapper.classList.remove("expanded");
  if (options) options.classList.remove("open", "visible");
  if (titleInput) titleInput.value = "";
  if (dateInput) dateInput.value = "";
  addActiveClass(id, className);
  setActiveIcon(id, icon[1]);
  resetAssignedUsers();
  resetSubtasksUI();
  clearValidationAlerts();
}

// addActiveClass(id, className);
// setActiveIcon(id, icon[1]);

// function resetPriorityButtonsUI() {
//   const buttons = document.querySelectorAll(".prio-button-container");
//   buttons.forEach(btn => btn.classList.remove("active"));
//   const mediumBtn = document.querySelector('prioButtons');
//   mediumBtn?.classList.add("prioMediumBtnActive");

// }

function resetAssignedUsers() {
  const checked = document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked");
  checked.forEach(cb => { cb.checked = false; });
  if (window.selectedUserNames) {
    window.selectedUserNames.clear();
  }
  const chipContainer = document.getElementById("selectedUser");
  if (chipContainer) chipContainer.innerHTML = "";
  updateSelectedUserDisplay?.();
  clearSelectedUserNamesHandler();
}

function resetSubtasksUI() {
  if (typeof setSubtaskItems === "function") setSubtaskItems([]);
  else if (Array.isArray(subtaskItemsList)) subtaskItemsList.length = 0;
  const input = document.getElementById("subtaskInput") || document.querySelector("#subtask-input");
  if (input) input.value = "";
  const list =
    document.getElementById("selectedUser");
  if (list) list.innerHTML = "";
}

function isFormValid({ select, titleInput, dateInput }) {
  const hasCategory = Boolean(select.dataset.selected);
  const hasTitle = titleInput.value.trim().length > 3;
  const hasDate = Boolean(dateInput.value.trim());
  return hasCategory && hasTitle && hasDate;
}

function clickOutsideToClose({ wrapper, select, options, arrow }) {
  if (!options || options.dataset.outsideBound === "true") return;
  options.dataset.outsideBound = "true";

  document.addEventListener("click", (e) => {
    const target = e.target;
    const isOpen = options.classList.contains("open") || options.classList.contains("visible");
    // if (!isOpen) return;

    const insideList = options.contains(target);
    const insideTrigger = (select && (select === target || select.contains(target)));
    const insideWrapper = (wrapper && wrapper.contains(target));

    // console.log("click in target:", target);
    // console.log("Open", isOpen);
    // console.log("clickInsideList", insideList);
    // console.log("clickInsideTrigger", insideTrigger);
    // console.log("clickInsideWrapper", insideWrapper);
    if (!insideList && !insideTrigger && !insideWrapper) {
      closeDropdown(options, wrapper, arrow);
    }
  });
}

async function toggleDropdown(options, wrapper, arrow, prioContainer) {
  if (!options) return;
  const isOpen = options.classList.toggle("open");
  options.classList.toggle("visible", isOpen);
  arrow?.classList.toggle("rotated", isOpen);
  wrapper?.classList.toggle("expanded", isOpen);
  if (!isOpen) return;
  if (options.id === "assignedUserList" && !options.dataset.usersLoaded) {
    await loadAndRenderUsers();
    options.dataset.usersLoaded = "true";
  }
  if (options.id === "assignedUserList-modal" && !options.dataset.usersLoaded) {
    await loadContactData();
    options.dataset.usersLoaded = "true";
  }
}

function closeDropdown(options, wrapper, arrow) {
  options.classList.remove("open");
  options.classList.remove("visible");
  arrow?.classList.remove("rotated");
  wrapper?.classList.remove("expanded");
}

function query(selectorOrElement) {
  return typeof selectorOrElement === "string" ? document.querySelector(selectorOrElement) : selectorOrElement;
}