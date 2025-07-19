import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";
import { getInitials } from "./boardUtils.js";
import { renderTasks } from "./taskRenderer.js";
import { 
  fetchTasksAndUsers,
  extractUsers,
  normalizeTasks,
  handleTaskFetchError 
} from "./taskManager.js";
import { openTaskModal } from "./modalManager.js";
import { setupDragAndDrop } from "./dragDropManager.js";
import { setupSearch } from "./searchManager.js";
import { requestData } from "../scripts/firebase.js";
import "./taskDetails.js";
import "./subtaskProgress.js";

// Global variables for task management
window.editingTaskId = null;
window.isEditMode = false;
let currentlyLoadedTasks = {};
let allSystemUsers = [];

// Initialize board when page loads
window.addEventListener("DOMContentLoaded", initializeBoardApplication);

function initializeBoardApplication() {
  setupAllEventListeners();
  setupDropdown("#openMenu", "#dropDownMenu");
  fetchAndLoadTasks();
  loadUserInitialsDisplay();
  setupMobileDeviceListeners();
}

function setupAllEventListeners() {
  const addNewTaskButton = document.getElementById("add-task-btn");
  if (addNewTaskButton) {
    addNewTaskButton.addEventListener("click", () => openTaskModal());
  }
  
  window.addEventListener("taskCreated", fetchAndLoadTasks);
  window.addEventListener("taskUpdated", fetchAndLoadTasks);
  
  setupBoardIconEventListeners();
}

function setupBoardIconEventListeners() {
  const boardIconElements = document.querySelectorAll(".board-icon");
  for (let iconIndex = 0; iconIndex < boardIconElements.length; iconIndex++) {
    const currentIcon = boardIconElements[iconIndex];
    currentIcon.addEventListener("click", () => openTaskModal());
  }
}

function closeDetailModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("d_none");
  overlay.innerHTML = "";
}

async function openTaskDetails(task) {
  const overlay = document.getElementById("modal-overlay");
  resetOverlay(overlay);

  const modalHTML = await fetchModalHTML("../edittask/taskdetail.html");
  overlay.innerHTML = modalHTML;

  renderTaskDetailData(task);
  const modal = overlay.querySelector("#taskDetailModal");

  setupCloseButton(modal, overlay);
  setupOutsideClickHandler(modal, overlay);
}

function resetOverlay(overlay) {
  overlay.innerHTML = "";
  overlay.classList.remove("d_none");
}

async function fetchModalHTML(path) {
  const res = await fetch(path);
  return await res.text();
}

function setupCloseButton(modal, overlay) {
  const closeBtn = modal.querySelector(".taskDetailCloseButton");
  closeBtn?.addEventListener("click", async () => {
    closeOverlay(overlay);
    await fetchTasks();
  });
}

function setupOutsideClickHandler(modal, overlay) {
  const handler = (event) => {
    const clickedInside = event.composedPath().includes(modal);
    const clickedOverlay = event.target === overlay;

    if (clickedInside || !clickedOverlay) return;

    closeOverlay(overlay);
    overlay.removeEventListener("click", handler);
    fetchTasks();
  };
  overlay.addEventListener("click", handler);
}

function closeOverlay(overlayElement) {
  overlayElement.classList.add("d_none");
  overlayElement.innerHTML = "";
}

function getPriorityIcon(priorityLevel) {
  const priorityIconMap = {
    low: "prio_overlay_low.svg",
    medium: "prio_overlay_medium.svg",
    urgent: "prio_overlay_urgent.svg",
  };
  const iconFileName = priorityIconMap[priorityLevel?.toLowerCase()] || priorityIconMap.low;
  return `<img src="../assets/icons/${iconFileName}" alt="${priorityLevel}">`;
}

function setupBoardDragAndDropHandlers() {
  const statusColumnMap = {
    'todo': 'toDo',
    'progress': 'inProgress', 
    'feedback': 'awaitFeedback',
    'done': 'done'
  };
  
  const columnIds = Object.values(statusColumnMap);
  for (let columnIndex = 0; columnIndex < columnIds.length; columnIndex++) {
    const columnId = columnIds[columnIndex];
    const column = document.getElementById(columnId);
    if (column) {
      column.addEventListener("dragover", (dragEvent) => {
        dragEvent.preventDefault();
        column.classList.add("drag-over");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
      });
      column.addEventListener("drop", (dropEvent) => {
        dropEvent.preventDefault();
        column.classList.remove("drag-over");
        handleDrop(dropEvent);
      });
    }
  }
}

function handleDrop(dropEvent) {
  const draggedTaskId = dropEvent.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(draggedTaskId);
  const targetListId = dropEvent.currentTarget.id;
  const newTaskStatus = getStatusFromElementId(targetListId);

  if (!taskElement || !newTaskStatus) return;

  const taskIdWithoutPrefix = draggedTaskId.replace("task-", "");
  const taskToUpdate = currentlyLoadedTasks[taskIdWithoutPrefix];
  if (!taskToUpdate) return;
  
  taskToUpdate.status = newTaskStatus;
  dropEvent.currentTarget.appendChild(taskElement);
  updateEmptyLists();
  updateTask(taskToUpdate);
}

function getStatusFromElementId(elementId) {
  const statusColumnMap = {
    'todo': 'toDo',
    'progress': 'inProgress', 
    'feedback': 'awaitFeedback',
    'done': 'done'
  };
  
  const statusEntries = Object.entries(statusColumnMap);
  for (let entryIndex = 0; entryIndex < statusEntries.length; entryIndex++) {
    const [statusKey, listId] = statusEntries[entryIndex];
    if (listId === elementId) {
      return statusKey;
    }
  }
  return null;
}

async function updateTask(taskToUpdate) {
  try {
    await requestData("PUT", `/tasks/${taskToUpdate.id}`, taskToUpdate);
  } catch (updateError) {
    // Handle task update error silently
  }
} 

const searchField = document.getElementById("searchFieldInput");
const searchButton = document.getElementById("inputIcon");

searchButton.addEventListener("click", handleSearch);
searchField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

function handleSearch() {
  const term = getSearchTerm();
  const hasMatches = filterTasksBySearchTerm(term);
  toggleNoResultsMessage(!hasMatches);
}

function getSearchTerm() {
  const input = document.getElementById("searchFieldInput");
  return input?.value?.toLowerCase().trim() || "";
}

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

function toggleNoResultsMessage(show) {
  const notice = document.getElementById("noTasksFoundNotice");
  if (!notice) return;
  notice.style.display = show ? "block" : "none";
}


function initSubtaskProgress(taskIdentifier = null, taskData = null) {
  const subtaskCheckboxes = document.querySelectorAll(".subtask-checkbox");
  for (let checkboxIndex = 0; checkboxIndex < subtaskCheckboxes.length; checkboxIndex++) {
    const currentCheckbox = subtaskCheckboxes[checkboxIndex];
    currentCheckbox.addEventListener("change", () => {
      updateSubtaskProgress(taskIdentifier);
      if (taskData) saveSubtaskState(taskData);
    });
  }
  updateSubtaskProgress(taskIdentifier);
}

function updateSubtaskProgress(taskIdentifier = null) {
  const allCheckboxes = document.querySelectorAll(".subtask-checkbox");
  const checkboxArray = [];
  for (let checkboxIndex = 0; checkboxIndex < allCheckboxes.length; checkboxIndex++) {
    checkboxArray.push(allCheckboxes[checkboxIndex]);
  }
  
  const totalSubtasks = checkboxArray.length;
  let completedSubtasks = 0;
  for (let checkboxIndex = 0; checkboxIndex < checkboxArray.length; checkboxIndex++) {
    if (checkboxArray[checkboxIndex].checked) {
      completedSubtasks++;
    }
  }
  
  setProgressText(completedSubtasks, totalSubtasks, taskIdentifier);
  setProgressBar(completedSubtasks, totalSubtasks, taskIdentifier);
}

function setProgressText(completedCount, totalCount, taskIdentifier) {
  const progressTextElementId = taskIdentifier
    ? `subtask-progress-text-${taskIdentifier}`
    : "subtask-progress-text";
  const progressTextElement = document.getElementById(progressTextElementId);
  if (progressTextElement) {
    progressTextElement.textContent = `${completedCount}/${totalCount} Subtasks`;
  }
}

function setProgressBar(completedCount, totalCount, taskIdentifier) {
  const progressBarElementId = taskIdentifier 
    ? `subtask-progressbar-${taskIdentifier}` 
    : "subtask-progressbar";
  const progressBarElement = document.getElementById(progressBarElementId);
  if (progressBarElement) {
    const progressPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;
    progressBarElement.style.width = `${progressPercentage}%`;
  }
}

function saveSubtaskState(taskData) {
  const allCheckboxes = document.querySelectorAll(".subtask-checkbox");
  const checkboxStates = [];
  for (let checkboxIndex = 0; checkboxIndex < allCheckboxes.length; checkboxIndex++) {
    const currentCheckbox = allCheckboxes[checkboxIndex];
    checkboxStates.push(currentCheckbox.checked);
  }
  taskData.subtaskDone = checkboxStates;
  updateTask(taskData);
}

function isMobileDevice() {
  return window.innerWidth <= 820;
}

function isLandscapeMode() {
  return window.matchMedia("(orientation: landscape)").matches;
}

function toggleRotateWarning() {
  const warning = document.getElementById("rotateWarning");
  const shouldShow = isMobileDevice() && isLandscapeMode();
  warning.style.display = shouldShow ? "flex" : "none";
}

window.addEventListener("orientationchange", toggleRotateWarning);
window.addEventListener("resize", toggleRotateWarning);
document.addEventListener("DOMContentLoaded", toggleRotateWarning);

// Load tasks from Firebase database
async function fetchAndLoadTasks() {
  try {
    const [tasksResponse, usersResponse] = await fetchTasksAndUsers();
    
    currentlyLoadedTasks = normalizeTasks(tasksResponse);
    allSystemUsers = extractUsers(usersResponse);
    
    await renderTasks(Object.values(currentlyLoadedTasks), allSystemUsers);
    setupDragAndDrop(currentlyLoadedTasks);
    setupSearch(currentlyLoadedTasks);
    updateEmptyLists();
  } catch (taskFetchError) {
    handleTaskFetchError(taskFetchError);
  }
}

// Load user initials from localStorage
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
