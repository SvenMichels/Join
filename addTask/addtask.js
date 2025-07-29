/**
 * Add Task Main Controller
 * Controls the entire Add Task form functionality.
 * 
 * @module AddTaskController
 */

import { requestData } from "../scripts/firebase.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";

import { 
  collectTaskData, 
  validateTask, 
  resetFormState, 
  clearValidationAlerts 
} from "./formManager.js";

import { selectPriority, initPriorityEventListeners } from "./priorityHandler.js";

import { 
  loadAndRenderUsers, 
  toggleUserAssignmentList, 
  setupUserSearch, 
  clearSelectedUsers 
} from "./userAssignmentHandler.js";

import { 
  addNewSubtask, 
  addSubtaskOnEnterKey, 
  renderSubtasks 
} from "./subtaskHandler.js";

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
function configureForm() {
  loadAndRenderUsers();
  selectPriority("medium");
  initPriorityEventListeners();

  const categorySelect = document.getElementById("category");
  const submitButton = document.querySelector(".create-button");

  if (submitButton && categorySelect) {
    submitButton.disabled = true;
    categorySelect.addEventListener("change", () => {
      submitButton.disabled = categorySelect.value.trim() === "";
    });
  }
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
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;

  const userData = JSON.parse(userString);
  const userName = userData.userFullName || "Guest";

  const menuButton = document.getElementById("openMenu");
  if (menuButton) {
    menuButton.textContent = getInitials(userName);
  }
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
}
