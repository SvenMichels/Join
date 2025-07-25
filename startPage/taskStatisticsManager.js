/**
 * Task Statistics Manager
 * Verwaltet Task-Statistiken und Datenverarbeitung
 */

import { setText } from "./loadingStateManager.js";

/**
 * Validiert Task-Daten Array
 * @param {Array} tasks - Array der Task-Daten
 * @returns {boolean} True wenn gültig
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
 * Aktualisiert Task-Summary-Anzeige
 * @param {Array} tasks - Array der Task-Daten
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
 * Zählt Tasks nach Status
 * @param {Array} tasks - Task Array
 * @param {string} status - Ziel-Status
 * @returns {number} Anzahl
 */
function countByStatus(tasks, status) {
  return tasks.filter(task => task.status === status).length;
}

/**
 * Zählt Tasks nach Priorität
 * @param {Array} tasks - Task Array  
 * @param {string} priority - Ziel-Priorität
 * @returns {number} Anzahl
 */
function countByPriority(tasks, priority) {
  const target = priority.toLowerCase();
  return tasks.filter(task => {
    const prio = (task.prio || "").toLowerCase();
    return prio === target;
  }).length;
}

/**
 * Ermittelt frühestes Urgent-Datum
 * @param {Array} tasks - Task Array
 * @returns {string|null} Formatiertes Datum oder null
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
