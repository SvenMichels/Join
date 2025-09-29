/**
 * Task Modal Main Controller
 * Main control for the Task Modal functionality.
 * @module taskfloat
 */
import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";
import {
  selectPriorityModal,
  getCurrentPriority,
  initPriorityEventListeners
} from "./priorityManager.js";
import {
  loadAndRenderUsersModal,
  toggleUserListModal,
  initUserSearchEventListener,
  clearSelectedUserNamesModal
} from "./userAssignmentManager.js";
import {
  addSubtaskModal,
  addSubtaskOnEnterModal,
  renderSubtasksModal,
  resetSubtasks,
  setSubtaskItems,
  setCompletedSubtasks,
  getSubtaskItems,
  getCompletedSubtasks,
  updateSubtasks
} from "../taskfloatdata/subtaskManager.js";
import { setupOutsideClickHandler, removeNoScroll } from "../board/taskDetails.js";
import { initInputField } from "../scripts/auth/Validation.js";
import { initFormAndButtonHandlers } from "../addtask/formManagerInit.js";
import { categorySave, categoryLoad } from "../board/boardUtils.js";

const $ = {};

/**
 * Initializes the Task Modal.
 * @returns {Promise<void>} Promise for the initialization.
 */
export function initTaskFloat() {
  cacheDom();
  if (!$.modal) {
    return Promise.resolve();
  }
  loadUserInitialsModal();
  initUserSearchEventListener();
  initPriorityEventListeners();
  initInputField("task-title-modal", 'titelModalHint', 'name');
  initInputField("task-description-modal", 'descriptionModalHint', 'subtask');
  initInputField("subtask-modal", 'subtaskModalHint', 'subtask');
  initInputField("task-date-modal", 'task-date-modal-Hint', 'date');
  initFormAndButtonHandlers("formWrapper");
  initFormAndButtonHandlers("assignedUserList-modal");
  attachEventListeners();
  updateModalSubmitState();
  return initFormModal();
}

/**
 * Caches DOM elements for better performance.
 * @returns {void}
 */
function cacheDom() {
  $.modal = document.querySelector(".form-wrapper-modal");
  if (!$.modal) return;
  $.closeBtn = $.modal?.querySelector(".close-button-modal");
  $.clearBtn = document.getElementById("clearBtn-modal");
  $.form = document.getElementById("taskForm-modal");
  $.date = document.getElementById("task-date-modal");
  $.subInput = document.getElementById("subtask-modal");
  $.subAddBtn = $.modal?.querySelector(".subtask-add-button-modal");
  $.assignBtn = $.modal?.querySelector(".assigned-userlist-button-modal");
  if ($.date) {
    $.date.min = new Date().toISOString().split("T")[0];
  }
  attachEventListeners();
}

/**
 * Binds event listeners to DOM elements.
 * @returns {void}
 */
function attachEventListeners() {
  bindCloseButton();
  bindFormSubmit();
  bindSubtaskAdd();
  bindSubtaskEnter();
  bindAssignToggle();
  bindClearButton();
  document
    .getElementById("task-title-modal")
    ?.addEventListener("input", updateModalSubmitState);
  $.date?.addEventListener("input", updateModalSubmitState);
}

/**
 * Binds close button event listener.
 * @returns {void}
 */
function bindCloseButton() {
  $.closeBtn?.addEventListener("click", closeModal);
}

/**
 * Binds form submit event listener.
 * @returns {void}
 */
function bindFormSubmit() {
  $.form?.addEventListener("submit", handleSubmitModal);
}

/**
 * Binds subtask add button event listener.
 * @returns {void}
 */
function bindSubtaskAdd() {
  $.subAddBtn?.addEventListener("click", addSubtaskModal);
}

/**
 * Binds subtask enter key event listener.
 * @returns {void}
 */
function bindSubtaskEnter() {
  $.subInput?.addEventListener("keydown", addSubtaskOnEnterModal);
}

/**
 * Binds assign toggle button event listener.
 * @returns {void}
 */
function bindAssignToggle() {
  $.assignBtn?.addEventListener("click", toggleUserListModal);
}

/**
 * Binds clear button event listener.
 * @returns {void}
 */
function bindClearButton() {
  $.clearBtn?.addEventListener("click", clearSelectedUserNamesModal);
}

/**
 * Initializes the modal form.
 * @returns {Promise<void>} Promise for the initialization.
 */
export async function initFormModal() {
  initializeSubtasks();
  clearSelectedUserNamesModal();
  await initializeUsers();
  initializePriority();
  initializeCategoryValidation();
}

/**
 * Initializes subtasks.
 * @returns {void}
 */
function initializeSubtasks() {
  resetSubtasks();
  renderSubtasksModal();
}

/**
 * Initializes the user system.
 * @returns {Promise<void>} Promise for loading users.
 */
async function initializeUsers() {
  await loadAndRenderUsersModal();
}

/**
 * Initializes the default priority.
 * @returns {void}
 */
function initializePriority() {
  selectPriorityModal("medium");
}

/**
 * Initializes category validation.
 * @returns {void}
 */
function initializeCategoryValidation() {
  const category = document.getElementById("category-modal");
  const submit = $.form?.querySelector(".create-button");

  if (!category || !submit) return;
  const updateSubmitState = () => {
    const value = category.value ?? "";
    submit.disabled = value.trim() === "";
  };
  updateSubmitState();
  category.addEventListener("change", updateSubmitState);
}

/**
 * Handles the modal form submission.
 * @param {Event} event - Submit event.
 * @returns {Promise<void>}
 */
async function handleSubmitModal(event) {
  event.preventDefault();
  const task = collectTaskDataModal(event.target);
  if (!validateTaskModal(task)) return;
  await saveTaskModal(task);
  resetFormState(task);
}

/**
 * Collects task data from the modal form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {Object} Task object with all collected data.
 */
function collectTaskDataModal(form) {
  const id = form.dataset.taskId || crypto.randomUUID();
  const status = form.dataset.taskStatus || "todo";
  const assignedUsers = Array.from(
    document.querySelectorAll(".user-checkbox-modal:checked")
  ).map(checkbox => checkbox.value);
  const categoryElement = document.getElementById("category-modal").innerHTML;
  const category = categorySave(categoryElement);

  return {
    id,
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: category,
    prio: getCurrentPriority(),
    assignedUsers,
    subtasks: [...getSubtaskItems()],
    subtaskDone: [...getCompletedSubtasks()],
    status,
  };
}

/**
 * Validates task data.
 * @param {Object} task - Task object to validate.
 * @returns {boolean} True if valid, false if invalid.
 */
function validateTaskModal(task) {
  const isValidTitle = validateField("titleAlert-modal", task.title);
  const isValidDate = validateField("dateAlert-modal", task.dueDate);
  const isValidCategory = validateField("categoryAlert-modal", task.category);

  return isValidTitle && isValidDate && isValidCategory;
}

/**
 * Validates a single field.
 * @param {string} alertId - ID of the alert element.
 * @param {*} value - Value to validate.
 * @returns {boolean} True if valid, false if invalid.
 */
function validateField(alertId, value) {
  const isValid = !!value;
  const alertElement = document.getElementById(alertId);

  if (alertElement) {
    alertElement.style.display = isValid ? "none" : "inline";
  }

  return isValid;
}

/**
 * Saves a task via the API.
 * @param {Object} task - Task object to save.
 * @returns {Promise<any>} Promise for the API request.
 */
const saveTaskModal = (task) => requestData("PUT", `/tasks/${task.id}`, task);

/**
 * Resets the form state after saving.
 * @param {Object} task - Saved task.
 * @returns {void}
 */
function resetFormState(task) {
  clearFormAttributes();
  dispatchTaskEvent(task);
  resetModalState();
  attachEventListeners();
  closeModal();
  removeNoScroll();
}

/**
 * Removes form attributes.
 * @returns {void}
 */
function clearFormAttributes() {
  if ($.form) {
    $.form.removeAttribute("data-task-id");
    $.form.removeAttribute("data-task-status");
  }
}

/**
 * Dispatches task event.
 * @param {Object} task - Task object for event.
 * @returns {void}
 */
function dispatchTaskEvent(task) {
  const eventType = window.isEditMode ? "taskUpdated" : "taskCreated";
  window.dispatchEvent(new CustomEvent(eventType, { detail: task }));
}

/**
 * Resets the modal state.
 * @returns {void}
 */
function resetModalState() {
  window.editingTaskId = null;
  window.isEditMode = false;
  resetSubtasks();
  window.pendingAssignedUsers = null;
  if ($.form) {
    $.form.reset();
  }
  clearSubtask();
  clearSelectedUserNamesModal();
  selectPriorityModal("medium");
}

/**
 * Clears subtask inputs.
 * @returns {void}
 */
function clearSubtask() {
  const subtaskInputs = document.getElementsByClassName("subtask-display-text-modal");
  Array.from(subtaskInputs).forEach(input => {
    input.value = "";
  });
}

/**
 * Fills the modal with task data for editing.
 * @param {Object} task - Task object to fill with.
 * @returns {Promise<void>}
 */
async function prefillModalWithTaskData(task) {
  fillBasicFields(task);
  updateSubtasks(task.subtasks, task.subtaskDone);
  renderSubtasksModal();

  const assigned = Array.isArray(task?.assignedUsers) ? task.assignedUsers
    : Array.isArray(task?.assignedTo) ? task.assignedTo
      : [];
  clearSelectedUserNamesModal();
  await loadAndRenderUsersModal(assigned);
}

/**
 * Fills the basic form fields with task data.
 * @param {Object} task - Task object with data.
 * @returns {void}
 */
function fillBasicFields(task) {
  document.getElementById("task-title-modal").value = task.title || "";
  document.getElementById("task-description-modal").value = task.description || "";
  document.getElementById("task-date-modal").value = task.dueDate || "";
  const categoryEl = document.getElementById("category-modal");
  if (categoryEl) {
    const rawCategory = task.category ? task.category.trim() : "";
    categoryEl.innerHTML = categoryLoad(rawCategory);
    categoryEl.dataset.selected = rawCategory;
    categoryEl.value = rawCategory;
  }
  selectPriorityModal((task.prio || "medium").toLowerCase());
  updateModalSubmitState();
}

/**
 * Loads and displays user initials in the modal.
 * @returns {void}
 */
function loadUserInitialsModal() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const btn = $.modal?.querySelector(".profile-button-modal");
  const userName = user.userFullName;
  if (btn && userName) btn.textContent = getInitials(userName);
}

/**
 * Closes the modal and cleans up.
 * @returns {void}
 */
export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.add("d_none");
    removeNoScroll();
    resetModalFormState();
  }
}

/**
 * Completely resets the modal form (for external use).
 * @returns {void}
 */
function resetModalFormState() {
  if (!$.form) {
    cacheDom();
  }

  clearFormAttributes();
  resetModalState();
  setSubtaskItems([]);
  setCompletedSubtasks([]);
  clearSelectedUserNamesModal();
  cacheDom();
  setupOutsideClickHandler($.modal, document.getElementById("modal-overlay"));
}

function updateModalSubmitState() {
  const submitBtn = $.form?.querySelector(".create-button");
  if (!submitBtn) return;
  const titleValue = document.getElementById("task-title-modal")?.value.trim() ?? "";
  const dateValue = document.getElementById("task-date-modal")?.value.trim() ?? "";
  const categoryEl = document.getElementById("category-modal");
  const categoryValue =
    categoryEl?.dataset.selected?.trim() ||
    categoryEl?.value?.trim() ||
    categoryEl?.textContent?.trim() ||
    "";

  submitBtn.disabled = !(titleValue && dateValue && categoryValue);
}

document.addEventListener("DOMContentLoaded", initTaskFloat);

window.initTaskFloat = initTaskFloat;
window.prefillModalWithTaskData = prefillModalWithTaskData;
window.resetModalFormState = resetModalFormState;