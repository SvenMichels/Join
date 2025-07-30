/**
 * @fileoverview Task Statistics Manager
 * Handles task data validation and dashboard statistics updates.
 * @module taskStatisticsManager
 */

import { setText } from "./loadingStateManager.js";

/**
 * Validates a task array structure.
 * 
 * @param {Array} tasks - Array of task objects.
 * @returns {boolean} True if the array is valid and contains required fields.
 */
export function validateTaskData(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return Array.isArray(tasks);
  }

  const sample = tasks[0];
  const required = ["title", "status"];

  return required.every(field => sample.hasOwnProperty(field));
}

/**
 * Updates the dashboard task summary display based on task data.
 * 
 * @param {Array} tasks - Array of task objects.
 */
export function setTextUpdateSummary(tasks) {
  const urgentCount = countByPriority(tasks, "urgent");
  const urgentDate = getEarliestUrgentDate(tasks);

  setText(".todoTaskAmount", countByStatus(tasks, "todo"));
  setText(".doneTaskAmount", countByStatus(tasks, "done"));
  setText(".taskInProgress", countByStatus(tasks, "in-progress"));
  setText(".awaitingFeedback", countByStatus(tasks, "await"));
  setText(".taskInBoard", tasks.length);
  setText(".urgentTaskAmount", urgentCount);

  const dateText = urgentDate || (urgentCount > 0 ? "No date set" : "No urgent tasks");
  setText(".urgentTaskDate", dateText);
}

/**
 * Counts the number of tasks with a specific status.
 * 
 * @param {Array} tasks - Array of task objects.
 * @param {string} status - Task status to filter by.
 * @returns {number} Number of matching tasks.
 */
function countByStatus(tasks, status) {
  return tasks.filter(task => task.status === status).length;
}

/**
 * Counts the number of tasks with a specific priority.
 * 
 * @param {Array} tasks - Array of task objects.
 * @param {string} priority - Task priority to filter by.
 * @returns {number} Number of matching tasks.
 */
function countByPriority(tasks, priority) {
  const target = priority.toLowerCase();
  return tasks.filter(task => {
    const prio = (task.prio || "").toLowerCase();
    return prio === target;
  }).length;
}

/**
 * Determines the earliest due date for urgent tasks.
 * 
 * @param {Array} tasks - Array of task objects.
 * @returns {string|null} Formatted date string or null if not available.
 */
function getEarliestUrgentDate(tasks) {
  const urgentWithDates = tasks.filter(task => {
    const isUrgent = (task.prio || "").toLowerCase() === "urgent";
    return isUrgent && task.dueDate;
  });

  if (urgentWithDates.length === 0) return null;

  const dates = urgentWithDates.map(task => new Date(task.dueDate));
  dates.sort((a, b) => a - b);

  const options = { year: "numeric", month: "long", day: "numeric" };
  return dates[0].toLocaleDateString("en-US", options);
}
