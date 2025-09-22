import { showValidateBubble, setFieldValidity } from "../scripts/auth/Validation.js";
import { getSubtaskMessage } from "../scripts/auth/validationsmessages.js";
import { categorySave } from "../board/boardUtils.js";
import { loadAndRenderUsers, setupUserSearch } from "./userAssignmentHandler.js";
import { handleSearchInput, loadContactData } from "../taskFloatData/userAssignmentManager.js";
import { getElementConfigsForAssignedTo, getElementConfigsForAssignedToModal, getElementConfigsForAddTaskModal, getElementConfigsForAddTask } from "./formManagerConfig.js";
import { clearFormState } from "./formManagerState.js";
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

function initAddTaskFlow() {
  const elements = getElementConfigsForAddTask();
  attachCoreEvents(elements);
  updateCreateButtonState(elements);
  setupUserSearch();
}

function initAddTaskModalFlow() {
  const elements = getElementConfigsForAddTaskModal();
  attachCoreEvents(elements);
  updateCreateButtonState(elements);
  handleSearchInput();
}

function initAssignedToFlow() {
  const elements = getElementConfigsForAssignedTo();
  ensureAssignedUsersLoaded(elements.options);
  attachCoreEvents(elements);
}

function initAssignedToModalFlow() {
  const elements = getElementConfigsForAssignedToModal();
  ensureAssignedUsersLoaded(elements.options);
  attachCoreEvents(elements);
}

export function initFormAndButtonHandlers(wrapperElementId) {
  const wrapper = document.getElementById(wrapperElementId);
  if (!wrapper) return;

  if (wrapper.id === "form-wrapper") {
    initAddTaskFlow();
  } else if (wrapper.id === "formWrapper") {
    initAddTaskModalFlow();
  } else if (wrapper.id === "assignedUserList" || wrapper.id === "assignedUserList-modal") {
    initAssignedToFlow();
  } else if (wrapper.id === "assignedUserList-modal") {
    initAssignedToModalFlow();
  }
}



function bindOnce(options) {
  if (options?.dataset.listenerBound === "true") return true;
  if (options) options.dataset.listenerBound = "true";
  return false;
}

function attachClearHandler(clearBtn, ctx) {
  clearBtn?.addEventListener("click", () =>
    clearFormState(ctx.wrapper, ctx.select, ctx.options, ctx.titleInput, ctx.dateInput, ctx.arrow)
  );
}

function attachToggleHandlers({ arrow, select, options, wrapper, prioContainer }) {
  const toggle = async (e) => {
    e.stopPropagation();
    await ensureAssignedUsersLoaded(options);
    toggleDropdown(options, wrapper, arrow, prioContainer);
  };

  arrow?.addEventListener("click", toggle);
  select?.addEventListener("click", async (e) => {
    await toggle(e);
    console.log("1", select, options, wrapper, arrow, prioContainer);
  });
}

function attachOptionsHandler({ options, select, wrapper, titleInput, dateInput, createButton, arrow, prioContainer }) {
  options?.addEventListener("click", (event) =>
    handleOptionClick(event, select, options, wrapper, { titleInput, dateInput, createButton }, arrow, prioContainer)
  );
}

function attachValidationInputs({ titleInput, dateInput, createButton, prioContainer, select }) {
  if (!(titleInput && dateInput && createButton && prioContainer && select)) return;

  [titleInput, dateInput].forEach((input) =>
    input.addEventListener("input", () =>
      updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton })
    )
  );
}

function ensureUsersIfVisible(options) {
  const isAssignedList =
    options?.id === "assignedUserList" || options?.id === "assignedUserList-modal";
  if (isAssignedList && options.classList.contains("visible")) {
    ensureAssignedUsersLoaded(options);
  }
}

function attachCoreEvents(ctx) {
  const { wrapper, select, options, titleInput, dateInput, createButton, arrow, prioContainer, clearBtn } = ctx;
  if (bindOnce(options)) return;

  attachClearHandler(clearBtn, ctx);
  attachToggleHandlers({ arrow, select, options, wrapper, prioContainer });
  attachOptionsHandler({ options, select, wrapper, titleInput, dateInput, createButton, arrow, prioContainer });
  attachValidationInputs({ titleInput, dateInput, createButton, prioContainer, select });
  ensureUsersIfVisible(options);

  setupGlobalOutsideClick(options);

  return { wrapper, select, options, titleInput, dateInput, createButton };
}

function isOpen(listEl) {
  return !!listEl && (listEl.classList.contains("open") || listEl.classList.contains("visible"));
}

function clickedInside(target, el) {
  return !!el && (el === target || el.contains(target));
}

function handleAssignedOutside(target) {
  const wrapper = document.querySelector(".assigned-input-wrapper");
  const list = document.getElementById("assignedUserList");
  const arrow = document.getElementById("assignedBtnImg");

  if (!isOpen(list)) return;

  const insideList = clickedInside(target, list);
  const insideWrapper = clickedInside(target, wrapper);
  if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

function handleAssignedOutsideModal(target) {
  const wrapper = document.querySelector(".assigned-input-wrapper");
  const list = document.getElementById("assignedUserList-modal");
  const arrow = document.getElementById("assignedBtnImg-modal");

  if (!isOpen(list)) return;

  const insideList = clickedInside(target, list);
  const insideWrapper = clickedInside(target, wrapper);
  if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

function handleCategoryOutside(target, options) {
  const select = document.getElementById("categorySelect");
  const list = document.getElementById("categoryOptions");
  const arrow = document.getElementById("categoryBtnImg");

  if (!isOpen(list)) return;

  const insideList = clickedInside(target, list);
  const insideTrigger = clickedInside(target, select);
  if (!insideList && !insideTrigger) {
    closeDropdown(list, select?.parentElement, arrow);
    subtaskExpander(false, options);
  }
}

function handleCategoryOutsideModal(target, options) {
  const select = document.getElementById("category-modal");
  const list = document.getElementById("categoryOptions-modal");
  const arrow = document.getElementById("categoryBtnImg-modal");

  if (!isOpen(list)) return;

  const insideList = clickedInside(target, list);
  const insideTrigger = clickedInside(target, select);
  if (!insideList && !insideTrigger) {
    closeDropdown(list, select?.parentElement, arrow);
    subtaskExpander(false, options);
  }
}

function setupGlobalOutsideClick(options) {
  if (document.body.dataset.outsideGlobalBound === "true") return;
  document.body.dataset.outsideGlobalBound = "true";

  document.addEventListener("click", (e) => {
    const target = e.target;
    handleAssignedOutside(target);
    handleAssignedOutsideModal(target);
    handleCategoryOutside(target, options);
    handleCategoryOutsideModal(target, options);
  });
}

async function ensureAssignedUsersLoaded(optionsEl) {
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

function handleOptionClick(event, select, options, wrapper, deps, arrow, prioContainer) {
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

function updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton }) {
  const valid = isFormValid({ select, titleInput, dateInput, prioContainer });
  createButton.disabled = !valid;
}



function isFormValid({ select, titleInput, dateInput }) {
  const hasCategory = Boolean(select.dataset.selected);
  const hasTitle = titleInput.value.trim().length > 3;
  const hasDate = Boolean(dateInput.value.trim());
  return hasCategory && hasTitle && hasDate;
}

const isOpenEl = (el) => !!el && (el.classList.contains("open") || el.classList.contains("visible"));
const isCategoryId = (id) => id === "categoryOptions" || id === "categoryOptions-modal";
const isAssignedId = (id) => id === "assignedUserList" || id === "assignedUserList-modal";

function getAssignedFrom(idRef) {
  const modal = idRef.includes("modal");
  return {
    list: document.getElementById(modal ? "assignedUserList-modal" : "assignedUserList"),
    wrapper: document.querySelector(".assigned-input-wrapper"),
    arrow: document.getElementById(modal ? "assignedBtnImg-modal" : "assignedBtnImg"),
  };
}

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

function closeAssignedIfOpen(idRef) {
  const { list, wrapper, arrow } = getAssignedFrom(idRef);
  if (isOpenEl(list)) closeDropdown(list, wrapper, arrow);
}

function closeCategoryIfOpen(idRef) {
  const { list, wrapper, arrow } = getCategoryFrom(idRef);
  if (isOpenEl(list)) closeDropdown(list, wrapper, arrow);
}

function ensureOthersClosed(options) {
  const id = options.id;
  if (isCategoryId(id)) {
    closeAssignedIfOpen(id);
  } else if (isAssignedId(id)) {
    closeCategoryIfOpen(id);
  }
}

function applyToggle(options, wrapper, arrow) {
  const isOpen = options.classList.toggle("open");
  options.classList.toggle("visible", isOpen);
  arrow?.classList.toggle("rotated", isOpen);
  wrapper?.classList.toggle("expanded", isOpen);
  return isOpen;
}

async function lazyLoadUsers(options) {
  const userLoadMap = {
    assignedUserList: loadAndRenderUsers,
    "assignedUserList-modal": loadContactData,
  };
  const loader = userLoadMap[options.id];
  if (loader && !options.dataset.usersLoaded) {
    await loader();
    options.dataset.userLoaded = "true";
  }
}

async function toggleDropdown(options, wrapper, arrow) {
  if (!options) return;

  ensureOthersClosed(options);

  const isOpen = applyToggle(options, wrapper, arrow);

  subtaskExpander(isOpen, options);

  if (!isOpen) return;
  await lazyLoadUsers(options);
}

const ARROW_IDS = ["categoryBtnImg", "categoryBtnImg-modal", "assignedBtnImg", "assignedBtnImg-modal"];

function removeClasses(selector, ...classes) {
  document.querySelectorAll(selector).forEach((el) => el.classList.remove(...classes));
}

function resetArrowsById(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("rotated");
  });
}

function resetArrowsBySelectors(selectors) {
  selectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.classList.remove("rotated");
  });
}

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
}


function subtaskExpander(isOpen, options) {
  const subContainer = document.querySelector(".prio-subtask-container");
  if (!subContainer) return;

  const shouldExpand = isOpen &&
    (options.id === "categoryOptions" || options.id === "categoryOptions-modal");

  subContainer.classList.toggle("container-margin", shouldExpand);
}