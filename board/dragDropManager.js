/**
 * @fileoverview Drag and drop logic for tasks in the Kanban board,
 * including dropdown behavior for status changes.
 */

import { initializeBoard } from "./board.js";
import { requestData } from "../scripts/firebase.js";
import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { renderTasks, TASK_STATUS_COLUMN_MAPPING } from "./taskRenderer.js";
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
  let isPickup = true;
  onPickup(dragEvent, isPickup);
}

function onPickup(event, isPickup = false) {
  if (isPickup) {
    const taskElement = event.target.closest(".task");
    if (taskElement) {
      taskElement.classList.add("task-list-dragging");
    disableAllTaskLists()}

  } return false;
  
}

function onDrop(event) {
  const taskElementID = event.id;
  const taskElement = document.getElementById(`task-${taskElementID}`);
  if (taskElement) {
    taskElement.classList.remove("task-list-dragging");
  }
  enableAllTaskLists();
}

function disableAllTaskLists() {
  document.querySelectorAll(".task").forEach(list => {
    list.classList.add("event-none");
  })
}

function enableAllTaskLists() {
  document.querySelectorAll(".task").forEach(list => {
    list.classList.remove("event-none");
  })
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
  onDrop(taskDataObject);
}

/**
 * Adds event listeners to the dropdown for moving tasks between columns.
 * 
 * @param {HTMLElement} taskElement - The task container element.
 * @param {string|number} taskId - The unique task identifier.
 * @param {Object} task - The task data object.
 */
export function setupMoveDropdown(taskElement, taskId, task) {
  const btn = taskElement.querySelector(`#moveDropdownBtn-${taskId}`);
  const dropdown = taskElement.querySelector(`#moveDropdown-${taskId}`);
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => toggleDropdown(e, dropdown));
  dropdown.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => dropdown.classList.add("dp-none"));

  bindMoveAction(dropdown, ".moveText:first-child", task, "prev");
  bindMoveAction(dropdown, ".moveText:last-child", task, "next");
}

function toggleDropdown(e, dropdown) {
  e.stopPropagation();
  document.querySelectorAll(".MoveDropdown").forEach(d => d.classList.add("dp-none"));
  dropdown.classList.toggle("dp-none");
}

function bindMoveAction(dropdown, selector, task, direction) {
  const btn = dropdown.querySelector(selector);
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveTaskOneColumn(task, direction);
    dropdown.classList.add("dp-none");
  });
}

/**
 * Moves a task one column forward or backward and saves it persistently.
 * 
 * @param {Object} task - Task object.
 * @param {"prev"|"next"} direction - Movement direction.
 */
function moveTaskOneColumn(task, direction) {
  const statusKeys = Object.keys(TASK_STATUS_COLUMN_MAPPING);
  const currentIndex = statusKeys.indexOf(task.status);
  if (currentIndex === -1) return;

  const newIndex = direction === "next"
    ? Math.min(currentIndex + 1, statusKeys.length - 1)
    : Math.max(currentIndex - 1, 0);
  if (newIndex === currentIndex) return;

  task.status = statusKeys[newIndex];
  updateTaskPositionInDOM(task);
  persistTaskStatus(task);
  updateEmptyLists();
  updateTask(task);
}

/**
 * Moves the task element in the DOM.
 * 
 * @param {Object} task - Task object.
 */
function updateTaskPositionInDOM(task) {
  const taskElement = document.getElementById(`task-${task.id}`);
  const targetColumn = document.getElementById(TASK_STATUS_COLUMN_MAPPING[task.status]);

  if (targetColumn && taskElement) {
    targetColumn.appendChild(taskElement);
    window.updateTask?.(task);
    window.updateEmptyLists?.();
  }
}

/**
 * Saves the updated task status to the backend.
 * 
 * @param {Object} task - Task object.
 */
function persistTaskStatus(task) {
  requestData("PUT", `/tasks/${task.id}`, task)
    .catch(error => console.error("Failed to save task status:", error));
}

window.addEventListener("DOMContentLoaded", () => {
  updateSwitchButtonVisibility();
  initializeBoard();
});

window.addEventListener("resize", updateSwitchButtonVisibility);

/**
 * Toggles visibility of `.switchPositionBtn` based on screen width.
 * 
 * - Adds `dp-none` class on devices wider than 900px (desktop/tablet).
 * - Removes `dp-none` class on mobile devices (width < 900px).
 */
export function updateSwitchButtonVisibility() {
  const isMobile = window.innerWidth <= 900;

  document.querySelectorAll(".switchPositionBtn").forEach(btn => {
    if (isMobile) {
      btn.classList.remove("dp-none");
    } else {
      btn.classList.add("dp-none");
    }
  });
}