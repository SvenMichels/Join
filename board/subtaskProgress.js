import { updateTask } from "./taskManager.js";

/**
 * Initializes subtask progress functionality
 * @param {string|null} taskId - Task ID for specific task or null for modal
 * @param {Object|null} task - Task object for saving state
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
 * Updates subtask progress display
 * @param {string|null} taskId - Task ID for specific task
 */
export function updateSubtaskProgress(taskId = null) {
  const boxes = [...document.querySelectorAll(".subtask-checkbox")];
  const total = boxes.length;
  const done = boxes.filter((b) => b.checked).length;
  
  setProgressText(done, total, taskId);
  setProgressBar(done, total, taskId);
}

/**
 * Sets progress text element
 * @param {number} done - Number of completed subtasks
 * @param {number} total - Total number of subtasks
 * @param {string|null} taskId - Task ID for specific task
 */
export function setProgressText(done, total, taskId) {
  const id = taskId
    ? `subtask-progress-text-${taskId}`
    : "subtask-progress-text";
    
  const text = document.getElementById(id);
  if (text) text.textContent = `${done}/${total} Subtasks`;
}

/**
 * Sets progress bar width
 * @param {number} done - Number of completed subtasks
 * @param {number} total - Total number of subtasks
 * @param {string|null} taskId - Task ID for specific task
 */
export function setProgressBar(done, total, taskId) {
  const id = taskId ? `subtask-progressbar-${taskId}` : "subtask-progressbar";
  const bar = document.getElementById(id);
  
  if (bar) {
    bar.style.width = total ? `${(done / total) * 100}%` : "0%";
  }
}

/**
 * Saves subtask completion state to database
 * @param {Object} task - Task object to update
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
