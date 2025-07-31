/**
 * @fileoverview Main board application controller for Kanban task management.
 * Handles board initialization, task loading, UI setup, search functionality,
 * and mobile orientation feedback.
 */

import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
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
window.addEventListener("click", setupDropdown);

/**
 * Initializes the board when DOM is fully loaded.
 */
export function initializeBoard() {
  setupUIComponents();
  setupEventHandlers();
  loadInitialData();
}

/**
 * Initializes static UI components.
 */
function setupUIComponents() {
  loadUserProfile();
  setupMobileDeviceListeners();
  highlightActiveNavigationLinks();
}

/**
 * Sets up global event handlers.
 */
function setupEventHandlers() {
  setupTaskCreationEvents();
  setupSearchEvents();
  setupOrientationEvents();
  setupUserChangeEvents();
}

/**
 * Binds event listeners for task creation buttons and lifecycle.
 */
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

/**
 * Sets up event listeners for the task search field.
 */
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

/**
 * Adds orientation-related event listeners for mobile feedback.
 */
function setupOrientationEvents() {
  const events = ["orientationchange", "resize", "DOMContentLoaded"];
  events.forEach(event => {
    window.addEventListener(event, handleOrientationChange);
  });
}

/**
 * Sets up event listeners for user changes (login/logout/page focus).
 */
function setupUserChangeEvents() {
  window.addEventListener("focus", handleUserChange);
  window.addEventListener("pageshow", handleUserChange);
  document.addEventListener("visibilitychange", handleUserChange);
}

/**
 * Loads initial task and user data on board load.
 * @returns {Promise<void>}
 */
async function loadInitialData() {
  await loadTasksAndUsers();
}

/**
 * Loads and prepares tasks and user data.
 * @returns {Promise<void>}
 */
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

/**
 * Loads the user profile from localStorage and updates UI.
 */
function loadUserProfile() {
  const userData = getUserFromStorage();
  if (!userData) return;
  
  const userName = userData.userFullName || "Guest";
  const profileButton = document.getElementById("openMenu");
  
  if (profileButton) {
    profileButton.textContent = getInitials(userName);
  }
}

/**
 * Returns current user from localStorage.
 * @returns {Object|null}
 */
function getUserFromStorage() {
  const userString = localStorage.getItem("currentUser");
  return userString ? JSON.parse(userString) : null;
}

/**
 * Executes the task search process.
 */
function executeSearch() {
  const searchTerm = getSearchTerm();
  const hasResults = filterTasks(searchTerm);
  showNoResultsMessage(!hasResults);
}

/**
 * Gets the current search term from the input field.
 * @returns {string}
 */
function getSearchTerm() {
  const input = document.getElementById("searchFieldInput");
  return input?.value?.toLowerCase().trim() || "";
}

/**
 * Filters tasks based on the given search term.
 * @param {string} searchTerm
 * @returns {boolean} True if at least one task matches
 */
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

/**
 * Checks whether the task matches the search term.
 * @param {Object} task
 * @param {string} searchTerm
 * @returns {boolean}
 */
function taskMatchesSearch(task, searchTerm) {
  const titleMatch = task.title.toLowerCase().includes(searchTerm);
  const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
  return titleMatch || descriptionMatch;
}

/**
 * Toggles visibility of "no tasks found" message.
 * @param {boolean} show
 */
function showNoResultsMessage(show) {
  const notice = document.getElementById("noTasksFoundNotice");
  if (notice) {
    notice.style.display = show ? "block" : "none";
  }
}

/**
 * Handles display of landscape warning on mobile devices.
 */
function handleOrientationChange() {
  const warning = document.getElementById("rotateWarning");
  const shouldShow = isMobile() && isLandscape();
  
  if (warning) {
    warning.style.display = shouldShow ? "flex" : "none";
  }
}

/**
 * Handles user changes by reloading tasks and user data.
 * This ensures that when a user switches accounts, the correct 
 * contacts and tasks are displayed.
 */
async function handleUserChange() {
  const currentUser = getUserFromStorage();
  if (!currentUser) return;
  
  // Reload tasks and contacts for the current user
  await loadTasksAndUsers();
  loadUserProfile();
}

/**
 * Detects if current device width is mobile range.
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth <= 820;
}

/**
 * Checks if device is currently in landscape mode.
 * @returns {boolean}
 */
function isLandscape() {
  return window.matchMedia("(orientation: landscape)").matches;
}
