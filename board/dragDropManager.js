/**
 * @fileoverview Drag and drop logic for tasks in the Kanban board,
 * including dropdown behavior for status changes.
 */

import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { TASK_STATUS_COLUMN_MAPPING } from "./taskRenderer.js";
import { updateTask, getStatusFromElementId } from "./taskManager.js";

/**
 * Initializes drag and drop behavior for all task columns.
 * 
 * @param {Object} loadedTasksRef - Reference to all loaded tasks indexed by ID.
 */
export function setupDragAndDrop(loadedTasksRef) {
  Object.values(TASK_STATUS_COLUMN_MAPPING).forEach((id) => {
    const column = document.getElementById(id);
    if (column) setupColumnDragEvents(column, loadedTasksRef);
  });
}

/**
 * Attaches drag event handlers to a single column element.
 * 
 * @param {HTMLElement} columnElement - Column DOM element.
 * @param {Object} loadedTasksReference - Reference to loaded task objects.
 */
function setupColumnDragEvents(columnElement, loadedTasksReference) {
  columnElement.addEventListener("dragover", handleDragOverEvent);
  columnElement.addEventListener("dragleave", handleDragLeaveEvent);
  columnElement.addEventListener("drop", (dropEvent) => handleDropEvent(dropEvent, loadedTasksReference));
}

/**
 * Handles the dragover event.
 * 
 * @param {DragEvent} dragEvent 
 */
function handleDragOverEvent(dragEvent) {
  dragEvent.preventDefault();
  dragEvent.currentTarget.classList.add("drag-over");
}

/**
 * Handles the dragleave event.
 * 
 * @param {DragEvent} dragLeaveEvent 
 */
function handleDragLeaveEvent(dragLeaveEvent) {
  dragLeaveEvent.currentTarget.classList.remove("drag-over");
}

/**
 * Handles the drop event when a task is dropped onto a new column.
 * 
 * @param {DragEvent} dropEvent 
 * @param {Object} loadedTasksReference 
 */
function handleDropEvent(dropEvent, loadedTasksReference) {
  dropEvent.preventDefault();
  dropEvent.currentTarget.classList.remove("drag-over");

  const extractedTaskData = extractTaskDataFromDropEvent(dropEvent, loadedTasksReference);
  if (!extractedTaskData.isValid) return;

  moveTaskToNewStatusColumn(extractedTaskData.task, extractedTaskData.newStatus, dropEvent.currentTarget);
}

/**
 * Extracts task and target column info from the drop event.
 * 
 * @param {DragEvent} dropEvent 
 * @param {Object} loadedTasksReference 
 * @returns {{isValid: boolean, task: Object, newStatus: string, taskElement: HTMLElement}} 
 */
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

/**
 * Moves a task element to a new column and updates its status.
 * 
 * @param {Object} taskDataObject 
 * @param {string} newTaskStatus 
 * @param {HTMLElement} targetColumnElement 
 */
function moveTaskToNewStatusColumn(taskDataObject, newTaskStatus, targetColumnElement) {
  taskDataObject.status = newTaskStatus;
  targetColumnElement.appendChild(document.getElementById(`task-${taskDataObject.id}`));
  updateEmptyLists();
  updateTask(taskDataObject);
}

/**
 * Sets up the dropdown menu toggle for a single task card.
 * 
 * @param {HTMLElement} taskElement - The task DOM element.
 * @param {string} taskId - Unique task ID.
 */
export function setupTaskDropdown(taskElement, taskId) {
  const btnId = `moveDropdownBtn-${taskId}`;
  const dropdownId = `moveDropdown-${taskId}`;

  const btn = taskElement.querySelector(`#${btnId}`);
  const dropdown = taskElement.querySelector(`#${dropdownId}`);

  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle("dp-none");
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());
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
 * Adds event listeners to the dropdown buttons for moving tasks forward or backward.
 * 
 * @param {HTMLElement} taskElement - Full task container.
 * @param {string|number} taskId - Task identifier.
 * @param {Object} task - Task data object.
 */
export function setupMoveDropdown(taskElement, taskId, task) {
  const btn = taskElement.querySelector(`#moveDropdownBtn-${taskId}`);
  const dropdown = taskElement.querySelector(`#moveDropdown-${taskId}`);

  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".MoveDropdown").forEach(d => {
      if (d !== dropdown) d.classList.add("dp-none");
    });
    dropdown.classList.toggle("dp-none");
  });

  dropdown.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => dropdown.classList.add("dp-none"));

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
 * Moves a task one column forward or backward.
 * 
 * @param {Object} task - Task object.
 * @param {"prev"|"next"} direction - Movement direction.
 */
function moveTaskOneColumn(task, direction) {
  const statusKeys = Object.keys(TASK_STATUS_COLUMN_MAPPING);
  const currentIndex = statusKeys.indexOf(task.status);

  if (currentIndex === -1) return;

  const newIndex =
    direction === "next"
      ? Math.min(currentIndex + 1, statusKeys.length - 1)
      : Math.max(currentIndex - 1, 0);

  if (newIndex === currentIndex) return;

  task.status = statusKeys[newIndex];

  const taskElement = document.getElementById(`task-${task.id}`);
  const targetColumnId = TASK_STATUS_COLUMN_MAPPING[task.status];
  const targetColumn = document.getElementById(targetColumnId);

  if (targetColumn && taskElement) {
    targetColumn.appendChild(taskElement);
    if (window.updateTask) window.updateTask(task);
    if (window.updateEmptyLists) window.updateEmptyLists();
  }
}
