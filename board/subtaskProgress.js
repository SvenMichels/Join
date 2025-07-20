import { updateTask } from "./taskManager.js";

/**
 * Initializes subtask progress functionality for task cards or modals
 * @param {string|null} taskId - Task ID for specific task or null for modal context
 * @param {Object|null} task - Task object containing subtask data for state persistence
 */
export function initSubtaskProgress(taskId = null, task = null) {
  document.querySelectorAll(".subtask-checkbox").forEach((cb) =>
    cb.addEventListener("change", () => {
      updateSubtaskProgress(taskId);
      if (task) saveSubtaskState(task);
    })
  );
  updateSubtaskProgress(taskId);
}

/**
 * Updates the visual progress display for subtasks
 * @param {string|null} taskId - Task ID for specific task identification
 */
export function updateSubtaskProgress(taskId = null) {
  const boxes = [...document.querySelectorAll(".subtask-checkbox")];
  const total = boxes.length;
  const done = boxes.filter((b) => b.checked).length;
  
  setProgressText(done, total, taskId);
  setProgressBar(done, total, taskId);
}

/**
 * Updates the progress text display element
 * @param {number} done - Number of completed subtasks
 * @param {number} total - Total number of subtasks
 * @param {string|null} taskId - Task ID for element identification
 */
export function setProgressText(done, total, taskId) {
  const id = taskId
    ? `subtask-progress-text-${taskId}`
    : "subtask-progress-text";
    
  const text = document.getElementById(id);
  if (text) text.textContent = `${done}/${total} Subtasks`;
}

/**
 * Updates the progress bar visual indicator
 * @param {number} done - Number of completed subtasks
 * @param {number} total - Total number of subtasks
 * @param {string|null} taskId - Task ID for element identification
 */
export function setProgressBar(done, total, taskId) {
  const id = taskId ? `subtask-progressbar-${taskId}` : "subtask-progressbar";
  const bar = document.getElementById(id);
  
  if (bar) {
    bar.style.width = total ? `${(done / total) * 100}%` : "0%";
  }
}

/**
 * Persists subtask completion state to database
 * @param {Object} task - Task object to update with new subtask states
 */
export function saveSubtaskState(task) {
  const boxes = [...document.querySelectorAll(".subtask-checkbox")];
  const states = boxes.map((cb) => cb.checked);
  
  task.subtaskDone = states;
  updateTask(task);
}

// Make functions globally available
window.initSubtaskProgress = initSubtaskProgress;
window.updateSubtaskProgress = updateSubtaskProgress;
