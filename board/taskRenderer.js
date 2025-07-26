import { 
  getCategoryIcon, 
  getPriorityIconPath, 
  generateAssignedChips,
  calculateSubtaskProgress 
} from "./boardUtils.js";

import { setupMoveDropdown } from "./dragDropManager.js";

// Board column IDs for different task statuses
export const TASK_STATUS_COLUMN_MAPPING = {
  todo: "todoList",
  "in-progress": "inProgressList",
  await: "awaitList",
  done: "doneList",
};

// Build complete task element for the board
export async function createTaskElement(taskData, allSystemUsers) {
  const taskElement = createBaseTaskElement(taskData);
  const subtaskProgressInfo = getSubtaskProgressData(taskData);
  
  taskElement.innerHTML = await generateTaskHTML(taskData, allSystemUsers, subtaskProgressInfo);
  setupTaskElementEvents(taskElement, taskData);
  
  return taskElement;
}

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

// Calculate subtask completion data
function getSubtaskProgressData(taskData) {
  let completedSubtasksCount = 0;
  if (Array.isArray(taskData.subtaskDone)) {
    for (const subtaskStatus of taskData.subtaskDone) {
      if (subtaskStatus) {
        completedSubtasksCount++;
      }
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

// Build complete HTML structure for task
async function generateTaskHTML(taskData, allSystemUsers, subtaskProgressInfo) {
  const categoryIconPath = getCategoryIcon(taskData.category);
  const iconFileName = categoryIconPath.split('/').pop();
  const priorityIconPath = getPriorityIconPath(taskData.prio);
  // Nur noch neues Format: assignedUsers
  const assignedUsersHTML = await generateAssignedChips(
    taskData.assignedUsers, 
    allSystemUsers
  );
  const progressBarHTML = generateSubtaskProgressBar(taskData.id, subtaskProgressInfo);

  const dropdownId = `moveDropdown-${taskData.id}`;
const btnId = `moveDropdownBtn-${taskData.id}`;

const taskHtmlTemplate = `
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
  </div>
`;

  return taskHtmlTemplate;

}

// Create progress bar HTML for subtask completion
function generateSubtaskProgressBar(taskIdentifier, progressInformation) {
  if (progressInformation.total === 0) {
    return "";
  }
  
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
 * Moves a task one column forward or backward based on current status.
 * 
 * @param {Object} task - The full task object.
 * @param {"prev"|"next"} direction - The direction to move ("prev" or "next").
 */
function moveTaskOneColumn(task, direction) {
  const statusKeys = Object.keys(TASK_STATUS_COLUMN_MAPPING);
  const currentIndex = statusKeys.indexOf(task.status);

  if (currentIndex === -1) return;

  const newIndex =
    direction === "next"
      ? Math.min(currentIndex + 1, statusKeys.length - 1)
      : Math.max(currentIndex - 1, 0);

  if (newIndex === currentIndex) return; // Kein Wechsel nötig

  // Status aktualisieren
  task.status = statusKeys[newIndex];

  const taskElement = document.getElementById(`task-${task.id}`);
  const targetColumnId = TASK_STATUS_COLUMN_MAPPING[task.status];
  const targetColumn = document.getElementById(targetColumnId);

  if (targetColumn && taskElement) {
    targetColumn.appendChild(taskElement);
    if (window.updateTask) window.updateTask(task); // falls global vorhanden
    if (window.updateEmptyLists) window.updateEmptyLists(); // optional
  }
}


function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

// Clear all task columns
export function clearTaskLists() {
  const taskColumnIds = Object.values(TASK_STATUS_COLUMN_MAPPING);
  for (let columnIndex = 0; columnIndex < taskColumnIds.length; columnIndex++) {
    const currentColumnId = taskColumnIds[columnIndex];
    const taskListElement = document.getElementById(currentColumnId);
    if (taskListElement) taskListElement.innerHTML = "";
  }
}

// Render all tasks to board
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
