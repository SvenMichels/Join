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
import { collectTaskData, validateTask, resetFormState, clearValidationAlerts } from "./formManager.js";
import { selectPriority, initPriorityEventListeners } from "./priorityHandler.js";
import { loadAndRenderUsers, toggleUserAssignmentList, setupUserSearch, clearSelectedUsers } from "./userAssignmentHandler.js";
import { addNewSubtask, addSubtaskOnEnterKey, renderSubtasks } from "./subtaskHandler.js";
import { initInputField } from "../scripts/auth/Validation.js";

/** @type {Object<string, HTMLElement>} */
const domCache = {};

document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

/**
 * Initializes the application by setting up everything.
 */
function initializeApplication() {
  cacheDomElements();
  setupEventListeners();
  configureForm();
  loadUserInitials();
  setupUserSearch();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
  setupMobileDeviceListeners();
  initInputField("task-title", 'titleHint', 'name');
  initInputField("task-description", 'descriptionHint', 'name');
  initInputField("subtask", 'subtaskHint', 'subtask');
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
  domCache.subtaskAddBtn?.addEventListener("click", addNewSubtask);
  domCache.subtaskInput?.addEventListener("keydown", addSubtaskOnEnterKey);
  domCache.assignUserBtn?.addEventListener("click", toggleUserAssignmentList);
  domCache.clearBtn?.addEventListener("click", clearAllFormData);
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

function getFormEls(doc = document) {
  return {
    categorySelect: doc.getElementById("category"),
    submitButton: doc.querySelector(".create-button"),
    taskDateInput: doc.getElementById("task-date"),
  };
}

function primeForm({ taskDateInput, submitButton }) {
  setMinDate(taskDateInput);
  submitButton.disabled = true;
}

function setMinDate(input) {
  if (input) input.min = new Date().toISOString().split("T")[0];
}

function attachListeners({ categorySelect, taskDateInput }, handler) {
  categorySelect?.addEventListener("change", handler);
  taskDateInput?.addEventListener("change", handler);
  taskDateInput?.addEventListener("input", handler);
}

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
