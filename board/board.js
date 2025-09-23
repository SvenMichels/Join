/**
 * @fileoverview Main board application controller for Kanban task management.
 * Handles board initialization, task loading, UI setup, search functionality,
 * and mobile orientation feedback.
 */

import { LocalStorageService } from "../scripts/utils/localStorageHelper.js";
import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";

import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";
import { highlightActiveNavigationLinks, setupOpenMenuListener } from "../scripts/utils/navUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { renderTasks } from "./taskRenderer.js";
import { fetchTasksAndUsers, normalizeTasks,} from "./taskManager.js";
import { openTaskModal } from "./modalManager.js";
import { loadContactsForTaskAssignment } from "../contactpage/contactService.js";
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
window.addEventListener("click", setupOpenMenuListener);

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
 * Initializes all event bindings related to task creation and updates.
 * This includes the main add-task button, board-specific task buttons,
 * and global task lifecycle listeners.
 *
 * @function setupTaskCreationEvents
 */
function setupTaskCreationEvents() {
  bindTaskAddButton();
  bindBoardIcons();
  bindTaskLifecycleEvents();
}

/**
 * Binds a click event to the main "Add Task" button, if it exists.
 * Searches by ID: 'add-task-btn' or fallback to 'add-task-board-button'.
 *
 * @function bindTaskAddButton
 * @private
 */
function bindTaskAddButton() {
  const addButton = document.getElementById("add-task-btn") || document.getElementById("add-task-board-button");
  if (!addButton) return;

  addButton.addEventListener("click", openTaskModal);
}

/**
 * Binds click events to all elements that allow creating a task from within the board.
 * Targets elements with the class 'board-icon' and 'add-task-board-button'.
 *
 * @function bindBoardIcons
 * @private
 */
function bindBoardIcons() {
  const icons = document.querySelectorAll(".board-icon, .add-task-board-button");
  icons.forEach(icon => {
    icon.addEventListener("click", openTaskModal);
  });
}

/**
 * Binds global event listeners for task lifecycle events:
 * - 'taskCreated': triggered after a new task has been successfully created.
 * - 'taskUpdated': triggered after a task has been edited or updated.
 * 
 * Both events call `loadTasksAndUsers` to refresh task data.
 *
 * @function bindTaskLifecycleEvents
 * @private
 */
function bindTaskLifecycleEvents() {
  window.addEventListener("taskCreated", loadTasksAndUsers);
  window.addEventListener("taskUpdated", loadTasksAndUsers);
}


/**
 * Updates the modal title to display "Add Task".
 *
 * This function selects the HTML element with the ID "modalTitle"
 * and sets its `textContent` to "Add Task". If the element is not found,
 * an error is logged to the console.
 *
 * @function changeModalTitle
 * @returns {void}
 */
export function changeModalTitleAdd() {
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent = "Add Task";
  } else {
    console.warn("[Board] Modal title element not found.");
  }
}

/**
 * Updates the modal title to display "Edit Task".
 *
 * This function selects the HTML element with the ID "modalTitle"
 * and sets its `textContent` to "Edit Task". If the element is not found,
 * an error is logged to the console.
 *
 * @function changeModalTitle
 * @returns {void}
 */
export function changeModalTitleEdit() {
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent = "Edit Task";
  } else {
    console.warn("[Board] Modal title element not found.");
  }
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
  const userChangeEvents = ["focus", "pageshow"];
  const documentEvents = ["visibilitychange"];
  userChangeEvents.forEach(event => {
    window.addEventListener(event, handleUserChange);
  });
  
  documentEvents.forEach(event => {
    document.addEventListener(event, handleUserChange);
  });
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
  try {
    const { tasks, users } = await fetchAndProcessData();
    
    await updateBoardWithData(tasks, users);
  } catch (error) {
    console.error("[Board] Failed to load tasks and users:", error);
  }
}

/**
 * Fetches raw data from APIs and processes it.
 * @returns {Promise<{tasks: Object, users: Array}>}
 */
async function fetchAndProcessData() {
  const [tasksResponse] = await fetchTasksAndUsers();
  const contactsList = await loadContactsForTaskAssignment();
  
  return {
    tasks: normalizeTasks(tasksResponse),
    users: contactsList || []
  };
}

/**
 * Updates the board state and UI with loaded data.
 * @param {Object} tasks - Normalized tasks object
 * @param {Array} users - Array of system users
 * @returns {Promise<void>}
 */
async function updateBoardWithData(tasks, users) {
  
  updateApplicationState(tasks, users);
  await initializeBoardComponents(tasks);
}

/**
 * Updates the global application state with new data.
 * @param {Object} tasks - Normalized tasks object
 * @param {Array} users - Array of system users
 */
function updateApplicationState(tasks, users) {
  currentlyLoadedTasks = tasks;
  allSystemUsers = users;  
}

/**
 * Initializes board components with the loaded data.
 * @param {Object} tasks - Normalized tasks object
 * @returns {Promise<void>}
 */
async function initializeBoardComponents(tasks) {
  await renderTasks(Object.values(tasks), allSystemUsers);
  
  setupDragAndDrop(tasks);
  setupSearch(tasks);
  updateEmptyLists();
}

/**
 * Loads the user profile from localStorage and updates UI.
 */
function loadUserProfile() {
  const userData = getUserData();
  const profileButton = getProfileButton();
  
  if (!profileButton) return;
  
  updateProfileButton(profileButton, userData);
}

/**
 * Retrieves user data from localStorage with validation.
 * @returns {Object|null} User data object or null if not found
 */
function getUserData() {
  const userData = LocalStorageService.getItem("currentUser");
  
  if (!userData) {
    console.debug("[Board] No user data found in localStorage.");
  }
  
  return userData;
}

/**
 * Gets the profile button element with error handling.
 * @returns {HTMLElement|null} Profile button element or null if not found
 */
function getProfileButton() {
  const profileButton = document.getElementById("openMenu");
  
  if (!profileButton) {
    return null;
  }
  return profileButton;
}

/**
 * Updates the profile button with user initials.
 * @param {HTMLElement} profileButton - The profile button element
 * @param {Object|null} userData - User data object
 */
function updateProfileButton(profileButton, userData) {
  const userName = userData?.userFullName || "Guest";
  profileButton.textContent = getInitials(userName);
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
  const currentUser = LocalStorageService.getItem("currentUser");
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
  return window.innerWidth <= 1320;
}

/**
 * Checks if device is currently in landscape mode.
 * @returns {boolean}
 */
function isLandscape() {
  return window.matchMedia("(orientation: landscape)").matches;
}
