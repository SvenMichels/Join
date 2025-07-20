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
 * Enables long-press touch-based drag and drop on mobile for the given element ID.
 *
 * @param {string} elementId - The ID of the element to make draggable via touch.
 */
export function enableMobileLongPressDragDrop(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let isDragging = false;
  let longPressTimeout = null;

  element.style.touchAction = "none"; // Verhindert Scroll während Drag

  element.addEventListener("touchstart", onTouchStart);
  element.addEventListener("touchmove", onTouchMove);
  element.addEventListener("touchend", onTouchEnd);
  element.addEventListener("touchcancel", resetDrag);

  /**
   * Starts long-press detection.
   * @param {TouchEvent} event
   */
  function onTouchStart(event) {
    if (event.touches.length > 1) return;

    longPressTimeout = setTimeout(() => {
      isDragging = true;
      element.classList.add("dragging");
      element.style.position = "absolute";
      element.style.zIndex = "1000";
    }, 400);
  }

  /**
   * Moves element to follow touch if dragging.
   * @param {TouchEvent} event
   */
  function onTouchMove(event) {
    if (!isDragging) return;

    const touch = event.touches[0];
    const offsetX = element.offsetWidth / 2;
    const offsetY = element.offsetHeight / 2;

    element.style.left = `${touch.pageX - offsetX}px`;
    element.style.top = `${touch.pageY - offsetY}px`;

    event.preventDefault();
  }

  /**
   * Ends dragging and drops element at touch end.
   * @param {TouchEvent} event
   */
  function onTouchEnd(event) {
    clearTimeout(longPressTimeout);
    if (!isDragging) return;

    const dropTarget = getDropTarget(event);
    if (dropTarget && dropTarget !== element && dropTarget.appendChild) {
      dropTarget.appendChild(element);
    }

    resetDrag();
  }

  /**
   * Cancels dragging and resets styles.
   */
  function resetDrag() {
    clearTimeout(longPressTimeout);
    isDragging = false;

    element.classList.remove("dragging");
    element.style.position = "";
    element.style.left = "";
    element.style.top = "";
    element.style.zIndex = "";
  }

  /**
   * Returns the element currently under the finger.
   * @param {TouchEvent} event
   * @returns {HTMLElement|null}
   */
  function getDropTarget(event) {
    const touch = event.changedTouches[0];
    return document.elementFromPoint(touch.clientX, touch.clientY);
  }
}

