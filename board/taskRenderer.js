import { 
  getCategoryIcon, 
  getPriorityIconPath, 
  generateAssignedChips,
  calculateSubtaskProgress 
} from "./boardUtils.js";

import { setupMoveDropdown } from "./dragDropManager.js";

/**
 * Maps task statuses to corresponding board column IDs.
 * @type {Object}
 */
export const TASK_STATUS_COLUMN_MAPPING = {
  todo: "todoList",
  "in-progress": "inProgressList",
  await: "awaitList",
  done: "doneList",
};

/**
 * Creates and returns the complete DOM element representing a task.
 * 
 * @param {Object} taskData - The data of the task.
 * @param {Array} allSystemUsers - List of all users in the system.
 * @returns {Promise<HTMLElement>} - The complete rendered task element.
 */
export async function createTaskElement(taskData, allSystemUsers) {
  const taskElement = createBaseTaskElement(taskData);
  const subtaskProgressInfo = getSubtaskProgressData(taskData);
  
  taskElement.innerHTML = await generateTaskHTML(taskData, allSystemUsers, subtaskProgressInfo);
  setupTaskElementEvents(taskElement, taskData);
  
  return taskElement;
}

/**
 * Creates the base DOM structure for a task.
 * 
 * @param {Object} taskData - Task data used for initialization.
 * @returns {HTMLElement} - The article DOM element for the task.
 */
function createBaseTaskElement(taskData) {
  const taskPriority = (taskData.prio || "medium").toLowerCase();
  const taskHasSubtasks = Array.isArray(taskData.subtasks) && taskData.subtasks.length > 0;
  
  const taskArticleElement = document.createElement("article");
  const priorityClass = `task prio-${taskPriority}`;
  const subtaskClass = taskHasSubtasks ? " has-subtasks" : "";
  
  taskArticleElement.className = priorityClass + subtaskClass;
  taskArticleElement.id = `task-${taskData.id}`;
  taskArticleElement.draggable = true;
  
  return taskArticleElement;
}

/**
 * Calculates the subtask progress information for rendering.
 * 
 * @param {Object} taskData - Task data including subtasks.
 * @returns {Object} - Subtask progress information (done, total, percent).
 */
function getSubtaskProgressData(taskData) {
  let completedSubtasksCount = 0;
  if (Array.isArray(taskData.subtaskDone)) {
    for (const subtaskStatus of taskData.subtaskDone) {
      if (subtaskStatus) completedSubtasksCount++;
    }
  }
  
  const totalSubtasksCount = Array.isArray(taskData.subtasks) ? taskData.subtasks.length : 0;
  const completionPercentage = calculateSubtaskProgress(taskData.subtaskDone, taskData.subtasks);
  
  return { 
    done: completedSubtasksCount, 
    total: totalSubtasksCount, 
    percent: completionPercentage 
  };
}

/**
 * Generates the inner HTML content for a task card.
 * 
 * @param {Object} taskData - Task data object.
 * @param {Array} allSystemUsers - All system users.
 * @param {Object} subtaskProgressInfo - Subtask progress metrics.
 * @returns {Promise<string>} - HTML string to inject into task card.
 */
async function generateTaskHTML(taskData, allSystemUsers, subtaskProgressInfo) {
  const categoryIconPath = getCategoryIcon(taskData.category);
  const iconFileName = categoryIconPath.split('/').pop();
  const priorityIconPath = getPriorityIconPath(taskData.prio);

  const assignedUsersHTML = await generateAssignedChips(taskData.assignedUsers, allSystemUsers);
  const progressBarHTML = generateSubtaskProgressBar(taskData.id, subtaskProgressInfo);

  return buildTaskHTMLTemplate({
    taskData, iconFileName, priorityIconPath, assignedUsersHTML, progressBarHTML
  });
}
/**
 * Generiert das HTML-Template für eine einzelne Task-Kachel.
 *
 * @function
 * @param {Object} taskData - Die Daten der Aufgabe (inkl. ID, Titel, Beschreibung, Kategorie, Priorität).
 * @param {string} iconFileName - Der Dateiname des Kategorie-Icons.
 * @param {string} priorityIconPath - Der Pfad zum Prioritäts-Icon.
 * @param {string} assignedUsersHTML - Der bereits gerenderte HTML-Code für die zugewiesenen Benutzer.
 * @param {string} progressBarHTML - Der bereits gerenderte HTML-Code für die Fortschrittsanzeige.
 * @returns {string} HTML-String der gesamten Task-Darstellung.
 */
function buildTaskHTMLTemplate({ taskData, iconFileName, priorityIconPath, assignedUsersHTML, progressBarHTML }) {
  const dropdownId = `moveDropdown-${taskData.id}`;
  const btnId = `moveDropdownBtn-${taskData.id}`;

  return `
    <div class="task-icon">
      <img src="../assets/icons/${iconFileName}" alt="${taskData.category}">
      <img class="switchPositionBtn" id="${btnId}" src="../assets/icons/Frame 380.svg" alt="">
    </div>
    <div class="MoveDropdown dp-none" id="${dropdownId}">
      <p class="moveHeader">Move to</p>
      <div class="moveList">
        <p class="moveText"><img class="moveImg" src="../assets/icons/arrow_upward.svg" alt="">last List</p>
        <p class="moveText"><img class="moveImg" src="../assets/icons/arrow_downward.svg" alt="">next List</p>
      </div>
    </div>
    <div>
      <h3>${taskData.title}</h3>
      <p class="task-description-style">${taskData.description}</p>
    </div>
    ${progressBarHTML}
    <div class="assigned-chips">
      <div class="assigned-chip-container">${assignedUsersHTML}</div>
      <img class="task-priority-img" src="${priorityIconPath}" alt="${taskData.prio}">
    </div>`;
}

/**
 * Creates HTML for the subtask progress bar.
 * 
 * @param {string|number} taskIdentifier - The ID of the task.
 * @param {Object} progressInformation - Subtask completion info.
 * @returns {string} - The progress bar HTML.
 */
function generateSubtaskProgressBar(taskIdentifier, progressInformation) {
  if (progressInformation.total === 0) return "";
  
  return `
    <div class="progress-bar-wrapper">
      <div class="progress-bar-container">
        <div id="subtask-progressbar-${taskIdentifier}" 
             class="progress-bar-fill" 
             style="width: ${progressInformation.percent}%;"></div>
      </div>
      <span id="subtask-progress-text-${taskIdentifier}" class="subtask-counter">
        ${progressInformation.done}/${progressInformation.total} Subtasks
      </span>
    </div>`;
}

/**
 * Sets up all interaction listeners for a task card element.
 * 
 * @param {HTMLElement} element - Task DOM element.
 * @param {Object} task - Task data.
 */
function setupTaskElementEvents(element, task) {
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("click", () => {
    if (window.openTaskDetails) {
      window.openTaskDetails(task);
    }
  });
  setupMoveDropdown(element, task.id, task);
}

/**
 * Handles the start of a drag event for task movement.
 * 
 * @param {DragEvent} event - The drag event object.
 */
function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

/**
 * Removes all task cards from all board columns.
 */
export function clearTaskLists() {
  const taskColumnIds = Object.values(TASK_STATUS_COLUMN_MAPPING);
  for (let columnIndex = 0; columnIndex < taskColumnIds.length; columnIndex++) {
    const currentColumnId = taskColumnIds[columnIndex];
    const taskListElement = document.getElementById(currentColumnId);
    if (taskListElement) taskListElement.innerHTML = "";
  }
}

/**
 * Renders all tasks on the board, distributed by status.
 * 
 * @param {Array} tasksArray - Array of task objects.
 * @param {Array} allSystemUsers - Array of all system users.
 */
export async function renderTasks(tasksArray, allSystemUsers) {
  if (!Array.isArray(tasksArray)) return;
  
  clearTaskLists();
  
  for (let taskIndex = 0; taskIndex < tasksArray.length; taskIndex++) {
    const currentTaskData = tasksArray[taskIndex];
    const taskHtmlElement = await createTaskElement(currentTaskData, allSystemUsers);
    const targetColumnId = TASK_STATUS_COLUMN_MAPPING[currentTaskData.status];
    const targetListElement = document.getElementById(targetColumnId);
    if (targetListElement) targetListElement.appendChild(taskHtmlElement);
  }
}
