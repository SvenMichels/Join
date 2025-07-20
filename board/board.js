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
  extractUsers,
  normalizeTasks,
} from "./taskManager.js";
import { openTaskModal } from "./modalManager.js";
import { setupDragAndDrop } from "./dragDropManager.js";
import { setupSearch } from "./searchManager.js";
import "./taskDetails.js";
import "./subtaskProgress.js";
import { enableMobileLongPressDragDrop } from "./dragDropManager.js";

// Global variables for task management
window.editingTaskId = null;
window.isEditMode = false;
let currentlyLoadedTasks = {};
let allSystemUsers = [];

/**
 * Initializes board application when DOM is ready
 */
window.addEventListener("DOMContentLoaded", initializeBoardApplication);

/**
 * Sets up board application with all necessary components
 */
function initializeBoardApplication() {
  setupAllEventListeners();
  setupDropdown("#openMenu", "#dropDownMenu");
  fetchAndLoadTasks();
  loadUserInitialsDisplay();
  setupMobileDeviceListeners();
}

/**
 * Attaches event listeners for board functionality
 */
function setupAllEventListeners() {
  const addNewTaskButton = document.getElementById("add-task-btn");
  if (addNewTaskButton) {
    addNewTaskButton.addEventListener("click", () => openTaskModal());
  }
  
  window.addEventListener("taskCreated", fetchAndLoadTasks);
  window.addEventListener("taskUpdated", fetchAndLoadTasks);
  
  setupBoardIconEventListeners();
  setupSearchEventListeners();
}

/**
 * Sets up search functionality with input field and button
 */
function setupSearchEventListeners() {
  const searchField = document.getElementById("searchFieldInput");
  const searchButton = document.getElementById("inputIcon");

  if (searchButton) {
    searchButton.addEventListener("click", handleSearch);
  }
  
  if (searchField) {
    searchField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") handleSearch();
    });
  }
}

/**
 * Attaches click event listeners to board icons for opening task modal
 */
function setupBoardIconEventListeners() {
  const boardIconElements = document.querySelectorAll(".board-icon");
  for (let iconIndex = 0; iconIndex < boardIconElements.length; iconIndex++) {
    const currentIcon = boardIconElements[iconIndex];
    currentIcon.addEventListener("click", () => openTaskModal());
  }
}

/**
 * Handles search functionality by filtering tasks and showing results
 */
function handleSearch() {
  const term = getSearchTerm();
  const hasMatches = filterTasksBySearchTerm(term);
  toggleNoResultsMessage(!hasMatches);
}

/**
 * Gets search term from input field
 * @returns {string} Trimmed lowercase search term
 */
function getSearchTerm() {
  const input = document.getElementById("searchFieldInput");
  return input?.value?.toLowerCase().trim() || "";
}

/**
 * Filters task elements by search term in title and description
 * @param {string} searchTerm - Term to search for in task content
 * @returns {boolean} Whether any tasks match the search term
 */
function filterTasksBySearchTerm(searchTerm) {
  let hasVisibleTask = false;

  const loadedTaskEntries = Object.values(currentlyLoadedTasks);
  for (let taskIndex = 0; taskIndex < loadedTaskEntries.length; taskIndex++) {
    const currentTask = loadedTaskEntries[taskIndex];
    const taskElement = document.getElementById(`task-${currentTask.id}`);
    if (!taskElement) continue;

    const titleMatches = currentTask.title.toLowerCase().includes(searchTerm);
    const descriptionMatches = currentTask.description.toLowerCase().includes(searchTerm);
    const isTaskVisible = titleMatches || descriptionMatches;

    taskElement.style.display = isTaskVisible ? "flex" : "none";

    if (isTaskVisible) hasVisibleTask = true;
  }

  return hasVisibleTask;
}

/**
 * Shows or hides no results message based on search results
 * @param {boolean} show - Whether to show the no results message
 */
function toggleNoResultsMessage(show) {
  const notice = document.getElementById("noTasksFoundNotice");
  if (!notice) return;
  notice.style.display = show ? "block" : "none";
}

/**
 * Checks if current viewport is mobile size
 * @returns {boolean} True if viewport width is 820px or less
 */
function isMobileDevice() {
  return window.innerWidth <= 820;
}

/**
 * Checks if device is in landscape orientation
 * @returns {boolean} True if device is in landscape mode
 */
function isLandscapeMode() {
  return window.matchMedia("(orientation: landscape)").matches;
}

/**
 * Shows or hides rotation warning based on device orientation
 */
function toggleRotateWarning() {
  const warning = document.getElementById("rotateWarning");
  const shouldShow = isMobileDevice() && isLandscapeMode();
  warning.style.display = shouldShow ? "flex" : "none";
}

window.addEventListener("orientationchange", toggleRotateWarning);
window.addEventListener("resize", toggleRotateWarning);
document.addEventListener("DOMContentLoaded", toggleRotateWarning);

/**
 * Fetches tasks and users from database and renders them on board
 */
async function fetchAndLoadTasks() {
  try {
    const [tasksResponse, usersResponse] = await fetchTasksAndUsers();
    
    currentlyLoadedTasks = normalizeTasks(tasksResponse);
    allSystemUsers = extractUsers(usersResponse);
    
    await renderTasks(Object.values(currentlyLoadedTasks), allSystemUsers);
    setupDragAndDrop(currentlyLoadedTasks);
    setupSearch(currentlyLoadedTasks);
    updateEmptyLists();
    enableMobileLongPressDragDrop("task-${task.id}");
  } catch (taskFetchError) {
    console.log("Error fetching tasks:", taskFetchError);
  }
}

/**
 * Loads and displays user initials in profile button from localStorage
 */
function loadUserInitialsDisplay() {
  const storedUserString = localStorage.getItem("currentUser");
  if (!storedUserString) return;
  
  const currentUserData = JSON.parse(storedUserString);
  const userDisplayName = currentUserData.userName || "Guest";
  const userProfileButton = document.getElementById("openMenu");
  
  if (userProfileButton) {
    userProfileButton.textContent = getInitials(userDisplayName);
  }
}

// Export globals for other modules
window.openTaskModal = openTaskModal;
window.loadedTasks = () => currentlyLoadedTasks;
window.allUsers = () => allSystemUsers;
window.fetchTasks = fetchAndLoadTasks;
