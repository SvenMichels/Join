/**
 * Add Task Main Controller
 * Controls the entire Add Task form functionality.
 * 
 * @module AddTaskController
 */

import { LocalStorageService } from "../scripts/utils/localStorageHelper.js";
import { requestData } from "../scripts/firebase.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";
import { validateTask, resetFormState, clearValidationAlerts } from "./formManager.js";
import { initFormAndButtonHandlers } from "./formManagerInit.js";
import { selectPriority, initPriorityEventListeners } from "./priorityHandler.js";
import { loadAndRenderUsers, initUserAssignmentList, setupUserSearch, clearSelectedUsers } from "./userAssignmentHandler.js";
import { loadAndRenderUsersModal, initUserSearchEventListener } from "../taskfloatdata/userAssignmentManager.js";
import { addNewSubtask, addSubtaskOnEnterKey, renderSubtasks } from "./subtaskHandler.js";
import { initInputField } from "../scripts/auth/Validation.js";
import { collectTaskData } from "./formManagerState.js";
import { checkNoLoggedInUser, logoutUserHandler } from "../scripts/events/logoutevent.js";

/** @type {Object<string, HTMLElement>} */
const domCache = {};

document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();

});

/**
 * Initializes the application by setting up everything.
 */
function initializeApplication() {
  logoutUserHandler();
  checkNoLoggedInUser();
  cacheDomElements();
  setupEventListeners();
  configureForm();
  loadAndRenderUsers();
  setupUserSearch();
  loadUserInitials();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
  setupMobileDeviceListeners();
  initializeFormFields()
}

/**
 * Initializes the application by setting up everything.
 */
function initializeFormFields() {
  initInputField("task-title", 'titleHint', 'subtask');
  initInputField("task-description", 'descriptionHint', 'subtask');
  initInputField("subtask", 'subtaskHint', 'subtask');
  initInputField("task-date", 'addtaskdatehint', 'date');
  initUserAssignmentList();
  initFormAndButtonHandlers("form-wrapper");
  initFormAndButtonHandlers("assignedUserList");
}

/**
 * Caches frequently used DOM elements.
 */
function cacheDomElements() {
  domCache.taskForm = document.getElementById("taskForm");
  domCache.taskDateInput = document.getElementById("task-date");
  domCache.subtaskInput = document.getElementById("subtask");
  domCache.subtaskAddBtn = document.querySelector(".subtask-add-button");
  domCache.assignUserBtn = document.querySelector(".assignUserListBtn");
  domCache.clearBtn = document.getElementById("clearBtn");

  if (domCache.taskDateInput) {
    domCache.taskDateInput.min = new Date().toISOString().split("T")[0];
  }
}

/**
 * Sets up all relevant event listeners.
 */
function setupEventListeners() {
  domCache.taskForm?.addEventListener("submit", handleFormSubmission);
  domCache.subtaskInput?.addEventListener("keydown", addSubtaskOnEnterKey);
  domCache.subtaskAddBtn?.setAttribute("type", "button");
  domCache.subtaskAddBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    addNewSubtask(e);
  });
  domCache.taskForm?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.closest("#subtaskArea")) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

/**
 * Configures the form: sets up priorities, loads users, etc.
 */
export function configureForm() {
  loadAndRenderUsers();
  selectPriority("medium");
  initPriorityEventListeners();

  const els = getFormEls();
  if (!els.submitButton) return;

  primeForm(els);
  attachListeners(els, () => updateSubmitState(els));
  updateSubmitState(els);
}

/**
 * Gets form elements for validation and configuration.
 * @param {Document} [doc=document] - Document context to search in.
 * @returns {Object} Object containing form element references.
 */
function getFormEls(doc = document) {
  return {
    categorySelect: doc.getElementById("category"),
    submitButton: doc.querySelector(".create-button"),
    taskDateInput: doc.getElementById("task-date"),
  };
}

/**
 * Initializes form with default settings and disabled submit button.
 * @param {Object} params - Parameter object.
 * @param {HTMLInputElement} params.taskDateInput - Date input element.
 * @param {HTMLButtonElement} params.submitButton - Submit button element.
 */
function primeForm({ taskDateInput, submitButton }) {
  setMinDate(taskDateInput);
  submitButton.disabled = true;
}

/**
 * Sets minimum date constraint on date input to today's date.
 * @param {HTMLInputElement} input - Date input element.
 */
function setMinDate(input) {
  if (input) input.min = new Date().toISOString().split("T")[0];
}

/**
 * Attaches event listeners to form elements for validation.
 * @param {Object} params - Parameter object.
 * @param {HTMLSelectElement} params.categorySelect - Category select element.
 * @param {HTMLInputElement} params.taskDateInput - Date input element.
 * @param {Function} handler - Event handler function.
 */
function attachListeners({ categorySelect, taskDateInput }, handler) {
  categorySelect?.addEventListener("change", handler);
  taskDateInput?.addEventListener("change", handler);
  taskDateInput?.addEventListener("input", handler);
}

/**
 * Updates submit button state based on form validity.
 * @param {Object} params - Parameter object.
 * @param {HTMLSelectElement} params.categorySelect - Category select element.
 * @param {HTMLInputElement} params.taskDateInput - Date input element.
 * @param {HTMLButtonElement} params.submitButton - Submit button element.
 */
function updateSubmitState({ categorySelect, taskDateInput, submitButton }) {
  const categoryOk = !!categorySelect?.value?.trim();
  const dateOk = !!taskDateInput?.value;
  submitButton.disabled = !(categoryOk && dateOk);
}

/**
 * Handles the task form submission event.
 * 
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleFormSubmission(event) {
  event.preventDefault();
  const taskData = collectTaskData(event.target);
  if (!validateTask(taskData)) return;
  await saveTask(taskData);

  setTimeout(() => {
    showUserFeedback();
    clearAllFormData();
  }, 100);
  setTimeout(() => {
    if (window.location.href.includes("board.html")) return;
    window.location.href = "../board/board.html";
  }, 1250);
}

/**
 * Sends the task data to backend for saving.
 * 
 * @param {Object} taskData - The task object to be saved.
 * @returns {Promise<any>} Response from the backend.
 */
async function saveTask(taskData) {
  const isNewTask = !taskData.id;
  const httpMethod = isNewTask ? "POST" : "PUT";
  const apiEndpoint = isNewTask ? "/tasks" : `/tasks/${taskData.id}`;
  return await requestData(httpMethod, apiEndpoint, taskData);
}

/**
 * Loads current user from localStorage and sets initials in profile menu.
 */
function loadUserInitials() {
  const userData = LocalStorageService.getItem("currentUser");
  const userName = userData && userData.userFullName ? userData.userFullName : "Guest";

  const menuButton = document.getElementById("openMenu");
  if (!menuButton) {
    console.error(`[AddTaskController] Button with id ${openMenu} not found`);
    return;
  }

  const initials = getInitials(userName);
  menuButton.textContent = initials;

}

/**
 * Displays visual feedback to the user after successful action.
 */
function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("d_none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("d_none");
      feedback.classList.remove("centerFeedback");
    }, 1500);
  });
}

/**
 * Resets and clears the task form data and UI states.
 */
function clearAllFormData() {
  domCache.taskForm?.reset();
  resetFormState();
  clearValidationAlerts();
  clearSelectedUsers();
  selectPriority("medium");
  renderSubtasks();
  setupMobileDeviceListeners();
  configureForm();
}