import { requestData } from '../scripts/firebase.js'

/**
 * Retrieves all tasks from the server and returns them as an array.
 * @async
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of task objects (empty if none).
 */
export async function fetchTasks() {
  const { data } = await requestData('GET', '/tasks/')
  return data ? Object.values(data) : []
}

/**
 * Counts how many tasks have a specific value for a given property.
 * @param {Array<Object>} tasks - The array of task objects.
 * @param {string} key - The property name to check (e.g., 'status' or 'prio').
 * @param {string} value - The property value to match (e.g., 'todo' or 'high').
 * @returns {number} The count of tasks matching the criteria.
 */
export function countBy(tasks, key, value) {
  return tasks.filter(t => (t[key] || '').toLowerCase() === value.toLowerCase()).length
}

/**
 * Returns the earliest due date among tasks with a given priority.
 * @param {Array<Object>} tasks - The array of task objects.
 * @param {string} prio - The priority level to filter by (e.g., 'high').
 * @returns {Date|null} The earliest Date object or null if none found.
 */
export function earliestDate(tasks, prio) {
  return tasks
    .filter(t => t.prio?.toLowerCase() === prio.toLowerCase() && t.dueDate)
    .map(t => new Date(t.dueDate))
    .sort((a, b) => a - b)[0] || null
}