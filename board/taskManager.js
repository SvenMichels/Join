/**
 * @fileove/**
 * Converts Firebase tasks response to normalized object format
 * @param {Object} firebaseTaskResponse - Firebase response containing task datanagement utilities for Firebase data operations
 */

import { requestData } from "../scripts/firebase.js";

/**
 * Fetches task data from Firebase
 * @returns {Promise<Array>} Array containing tasks response
 */
export async function fetchTasksAndUsers() {
  const tasksRequest = requestData("GET", "/tasks/");
  return Promise.all([tasksRequest]);
}

/**
 * Converts Firebase users response to array format
 * @param {Object} firebaseUserResponse - Firebase response containing user data
 * @returns {Array} Array of user objects
 */
export function extractUsers(firebaseUserResponse) {
  const userDataObject = firebaseUserResponse?.data || {};
  return Object.values(userDataObject);
}

/**
 * Converts Firebase task structure to normalized format with proper IDs
 * @param {Object} firebaseTaskResponse - Firebase response containing task data
 * @returns {Object} Normalized tasks collection with task IDs as keys
 */
export function normalizeTasks(firebaseTaskResponse) {
  const normalizedTasksCollection = {};
  const rawTaskData = firebaseTaskResponse?.data || {};

  for (const [taskId, taskInformation] of Object.entries(rawTaskData)) {
    normalizedTasksCollection[taskId] = prepareTaskData(taskId, taskInformation);
  }

  return normalizedTasksCollection;
}

/**
 * Prepares individual task with proper structure and validated subtask data
 * @param {string} taskIdentifier - Unique task identifier
 * @param {Object} rawTaskInformation - Raw task data from Firebase
 * @returns {Object} Prepared task object with validated subtask completion array
 */
function prepareTaskData(taskIdentifier, rawTaskInformation) {
  const subtaskCount = rawTaskInformation.subtasks?.length || 0;
  const isValidArray = Array.isArray(rawTaskInformation.subtaskDone);
  const lengthMatches = rawTaskInformation.subtaskDone?.length === subtaskCount;

  return {
    ...rawTaskInformation,
    id: taskIdentifier,
    subtaskDone: isValidArray && lengthMatches
      ? rawTaskInformation.subtaskDone
      : new Array(subtaskCount).fill(false),
  };
}

/**
 * Updates existing task in Firebase database
 * @param {Object} taskDataToUpdate - Task object containing updated data
 */
export async function updateTask(taskDataToUpdate) {
    await requestData("PUT", `/tasks/${taskDataToUpdate.id}`, taskDataToUpdate);
}

/**
 * Deletes a task from Firebase database
 * @param {string} taskIdentifierToDelete - ID of task to delete
 */
export async function deleteTask(taskIdentifierToDelete) {
  await requestData("DELETE", `/tasks/${taskIdentifierToDelete}`);
}

// Gets status from board element ID
export function getStatusFromElementId(boardElementId, statusMappingObject) {
  const statusEntries = Object.entries(statusMappingObject);
  
  for (let entryIndex = 0; entryIndex < statusEntries.length; entryIndex++) {
    const [statusKey, listId] = statusEntries[entryIndex];
    if (listId === boardElementId) {
      return statusKey;
    }
  }
  render
  return null;
}
