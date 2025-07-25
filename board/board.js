/**
 * @fileoverview Main board application controller for Kanban task management
 */

import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { renderTasks } from "./taskRenderer.js";
import { 
  fetchTasksAndUsers,
  normalizeTasks,
} from "./taskManager.js";
import { openTaskModal } from "./modalManager.js";
import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";
import { setupDragAndDrop } from "./dragDropManager.js";
import { setupSearch } from "./searchManager.js";
import "./taskDetails.js";
import "./subtaskProgress.js";

// Application state
let currentlyLoadedTasks = {};
let allSystemUsers = [];

// Global exports for other modules
window.editingTaskId = null;
window.isEditMode = false;
window.openTaskModal = openTaskModal;
window.loadedTasks = () => currentlyLoadedTasks;
window.allUsers = () => allSystemUsers;
window.fetchTasks = loadTasksAndUsers;

window.addEventListener("DOMContentLoaded", initializeBoard);

function initializeBoard() {
  setupUIComponents();
  setupEventHandlers();
  loadInitialData();
}

function setupUIComponents() {
  setupDropdown("#openMenu", "#dropDownMenu");
  loadUserProfile();
  setupMobileDeviceListeners();
}

function setupEventHandlers() {
  setupTaskCreationEvents();
  setupSearchEvents();
  setupOrientationEvents();
}

function setupTaskCreationEvents() {
  const addButton = document.getElementById("add-task-btn");
  if (addButton) {
    addButton.addEventListener("click", openTaskModal);
  }

  const boardIcons = document.querySelectorAll(".board-icon");
  boardIcons.forEach(icon => {
    icon.addEventListener("click", openTaskModal);
  });

  window.addEventListener("taskCreated", loadTasksAndUsers);
  window.addEventListener("taskUpdated", loadTasksAndUsers);
}

function setupSearchEvents() {
  const searchField = document.getElementById("searchFieldInput");
  const searchButton = document.getElementById("inputIcon");

  if (searchButton) {
    searchButton.addEventListener("click", executeSearch);
  }
  
  if (searchField) {
    searchField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") executeSearch();
    });
  }
}

function setupOrientationEvents() {
  const events = ["orientationchange", "resize", "DOMContentLoaded"];
  events.forEach(event => {
    window.addEventListener(event, handleOrientationChange);
  });
}

async function loadInitialData() {
  await loadTasksAndUsers();
}

async function loadTasksAndUsers() {
  const [tasksResponse] = await fetchTasksAndUsers();
  const contactsList = await loadContactsForTaskAssignment();
  
  currentlyLoadedTasks = normalizeTasks(tasksResponse);
  allSystemUsers = contactsList || [];
  
  await renderTasks(Object.values(currentlyLoadedTasks), allSystemUsers);
  setupDragAndDrop(currentlyLoadedTasks);
  setupSearch(currentlyLoadedTasks);
  updateEmptyLists();
}

function loadUserProfile() {
  const userData = getUserFromStorage();
  if (!userData) return;
  
  const userName = userData.userFullName || "Guest";
  const profileButton = document.getElementById("openMenu");
  
  if (profileButton) {
    profileButton.textContent = getInitials(userName);
  }
}

function getUserFromStorage() {
  const userString = localStorage.getItem("currentUser");
  return userString ? JSON.parse(userString) : null;
}

function executeSearch() {
  const searchTerm = getSearchTerm();
  const hasResults = filterTasks(searchTerm);
  showNoResultsMessage(!hasResults);
}

function getSearchTerm() {
  const input = document.getElementById("searchFieldInput");
  return input?.value?.toLowerCase().trim() || "";
}

function filterTasks(searchTerm) {
  const tasks = Object.values(currentlyLoadedTasks);
  let hasVisibleTasks = false;

  tasks.forEach(task => {
    const element = document.getElementById(`task-${task.id}`);
    if (!element) return;

    const isVisible = taskMatchesSearch(task, searchTerm);
    element.style.display = isVisible ? "flex" : "none";
    
    if (isVisible) hasVisibleTasks = true;
  });

  return hasVisibleTasks;
}

function taskMatchesSearch(task, searchTerm) {
  const titleMatch = task.title.toLowerCase().includes(searchTerm);
  const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
  return titleMatch || descriptionMatch;
}

function showNoResultsMessage(show) {
  const notice = document.getElementById("noTasksFoundNotice");
  if (notice) {
    notice.style.display = show ? "block" : "none";
  }
}

function handleOrientationChange() {
  const warning = document.getElementById("rotateWarning");
  const shouldShow = isMobile() && isLandscape();
  
  if (warning) {
    warning.style.display = shouldShow ? "flex" : "none";
  }
}

function isMobile() {
  return window.innerWidth <= 820;
}

function isLandscape() {
  return window.matchMedia("(orientation: landscape)").matches;
}
