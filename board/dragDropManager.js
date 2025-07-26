import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { TASK_STATUS_COLUMN_MAPPING } from "./taskRenderer.js";
import { updateTask, getStatusFromElementId } from "./taskManager.js";

// Setup drag and drop for all columns
export function setupDragAndDrop(loadedTasksRef) {
  Object.values(TASK_STATUS_COLUMN_MAPPING).forEach((id) => {
    const column = document.getElementById(id);
    if (column) setupColumnDragEvents(column, loadedTasksRef);
  });
}

function setupColumnDragEvents(columnElement, loadedTasksReference) {
  columnElement.addEventListener("dragover", handleDragOverEvent);
  columnElement.addEventListener("dragleave", handleDragLeaveEvent);
  columnElement.addEventListener("drop", (dropEvent) => handleDropEvent(dropEvent, loadedTasksReference));
}

function handleDragOverEvent(dragEvent) {
  dragEvent.preventDefault();
  dragEvent.currentTarget.classList.add("drag-over");
}

// Handles drag leave event
function handleDragLeaveEvent(dragLeaveEvent) {
  dragLeaveEvent.currentTarget.classList.remove("drag-over");
}

// Handles drop event for task movement
function handleDropEvent(dropEvent, loadedTasksReference) {
  dropEvent.preventDefault();
  dropEvent.currentTarget.classList.remove("drag-over");
  
  const extractedTaskData = extractTaskDataFromDropEvent(dropEvent, loadedTasksReference);
  if (!extractedTaskData.isValid) return;

  moveTaskToNewStatusColumn(extractedTaskData.task, extractedTaskData.newStatus, dropEvent.currentTarget);
}

// Extracts task data from drop event
function extractTaskDataFromDropEvent(dropEvent, loadedTasksReference) {
  const draggedTaskId = dropEvent.dataTransfer.getData("text/plain");
  const draggedTaskElement = document.getElementById(draggedTaskId);
  const targetColumnId = dropEvent.currentTarget.id;
  const newTaskStatus = getStatusFromElementId(targetColumnId, TASK_STATUS_COLUMN_MAPPING);
  const taskIdentifier = draggedTaskId.replace("task-", "");
  const taskDataObject = loadedTasksReference[taskIdentifier];

  return {
    isValid: draggedTaskElement && newTaskStatus && taskDataObject,
    task: taskDataObject,
    newStatus: newTaskStatus,
    taskElement: draggedTaskElement
  };
}

// Moves task to new status column
function moveTaskToNewStatusColumn(taskDataObject, newTaskStatus, targetColumnElement) {
  taskDataObject.status = newTaskStatus;
  targetColumnElement.appendChild(document.getElementById(`task-${taskDataObject.id}`));
  updateEmptyLists();
  updateTask(taskDataObject);
}

/**
 * Handles the dropdown toggle behavior for a task card.
 *
 * @param {HTMLElement} taskElement - The task DOM element.
 * @param {string} taskId - The task ID.
 */
export function setupTaskDropdown(taskElement, taskId) {
  const btnId = `moveDropdownBtn-${taskId}`;
  const dropdownId = `moveDropdown-${taskId}`;

  const btn = taskElement.querySelector(`#${btnId}`);
  const dropdown = taskElement.querySelector(`#${dropdownId}`);

  if (!btn || !dropdown) return;

  // Toggle dropdown on button click
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle("dp-none");
  });

  // Prevent click inside dropdown from closing it
  dropdown.addEventListener("click", (e) => e.stopPropagation());

  // Global click to close any open dropdowns
  document.addEventListener("click", closeAllDropdowns);

  /**
   * Closes all move dropdowns globally.
   */
  function closeAllDropdowns() {
    document.querySelectorAll(".MoveDropdown").forEach((d) => {
      d.classList.add("dp-none");
    });
  }
}

/**
 * Attaches event handlers for the move dropdown per task.
 * Ensures dropdown toggles without affecting other tasks.
 * 
 * @param {HTMLElement} taskElement - The complete rendered task container.
 * @param {string|number} taskId - The unique task ID to target button & dropdown.
 */
export function setupMoveDropdown(taskElement, taskId, task) {
  const btn = taskElement.querySelector(`#moveDropdownBtn-${taskId}`);
  const dropdown = taskElement.querySelector(`#moveDropdown-${taskId}`);

  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Close other dropdowns
    document.querySelectorAll(".MoveDropdown").forEach(d => {
      if (d !== dropdown) d.classList.add("dp-none");
    });

    dropdown.classList.toggle("dp-none");
  });

  // Prevent click inside dropdown from bubbling to close listener
  dropdown.addEventListener("click", e => e.stopPropagation());

  // Global close on outside click
  document.addEventListener("click", () => {
    dropdown.classList.add("dp-none");
  });

const lastListBtn = dropdown.querySelector(".moveText:first-child");
const nextListBtn = dropdown.querySelector(".moveText:last-child");

if (lastListBtn) {
  lastListBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveTaskOneColumn(task, "prev");
    dropdown.classList.add("dp-none");
  });
}

if (nextListBtn) {
  nextListBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveTaskOneColumn(task, "next");
    dropdown.classList.add("dp-none");
  });
}

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
