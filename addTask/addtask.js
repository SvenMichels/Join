/**
 * Add Task Main Controller
 * Hauptsteuerung für das Add Task Formular
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

const domCache = {};

document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

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

function cacheDomElements() {
  domCache.taskForm = document.getElementById("taskForm");
  domCache.taskDateInput = document.getElementById("task-date");
  domCache.subtaskInput = document.getElementById("subtask");
  domCache.subtaskAddBtn = document.querySelector(".subtask-add-button");
  domCache.assignUserBtn = document.querySelector(".assignUserListBtn");
  domCache.clearBtn = document.getElementById("clearBtn");

  // Set minimum date to today
  if (domCache.taskDateInput) {
    domCache.taskDateInput.min = new Date().toISOString().split("T")[0];
  }
}

function setupEventListeners() {
  domCache.taskForm?.addEventListener("submit", handleFormSubmission);
  domCache.subtaskAddBtn?.addEventListener("click", addNewSubtask);
  domCache.subtaskInput?.addEventListener("keydown", addSubtaskOnEnterKey);
  domCache.assignUserBtn?.addEventListener("click", toggleUserAssignmentList);
  domCache.clearBtn?.addEventListener("click", clearAllFormData);
}

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

async function saveTask(taskData) {
  const isNewTask = !taskData.id;
  const httpMethod = isNewTask ? "POST" : "PUT";
  const apiEndpoint = isNewTask ? "/tasks" : `/tasks/${taskData.id}`;
  
  return await requestData(httpMethod, apiEndpoint, taskData);
}

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

function clearAllFormData() {
  domCache.taskForm?.reset();
  resetFormState();
  clearValidationAlerts();
  clearSelectedUsers();
  selectPriority("medium");
  renderSubtasks();
  setupMobileDeviceListeners();
}
