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
 * Öffnet oder schließt das MoveDropdown-Menü.
 * @returns {void}
 */
function toggleMoveDropdown() {
  const dropdown = document.querySelector('.MoveDropdown');
  if (!dropdown) return;
  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    dropdown.style.display = 'flex';
  } else {
    dropdown.style.display = 'none';
  }
}

/**
 * Initialisiert EventListener für das MoveDropdown und verhindert Event-Bubbling.
 * @returns {void}
 */
function setupMoveDropdownEvents() {
  const btn = document.getElementById('moveDropdownBtn');
  const dropdown = document.querySelector('.MoveDropdown');

  btn?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMoveDropdown();
  });

  dropdown?.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('click', () => {
    if (dropdown) dropdown.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMoveDropdownEvents();
});