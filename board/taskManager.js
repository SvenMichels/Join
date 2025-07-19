import { requestData } from "../scripts/firebase.js";

// Load tasks and users data simultaneously from Firebase
export async function fetchTasksAndUsers() {
  const tasksRequest = requestData("GET", "/tasks/");
  const usersRequest = requestData("GET", "/users");
  
  return Promise.all([tasksRequest, usersRequest]);
}

// Convert users response to array format
export function extractUsers(firebaseUserResponse) {
  const userDataObject = firebaseUserResponse?.data || {};
  return Object.values(userDataObject);
}

// Convert Firebase task structure to normalized format
export function normalizeTasks(firebaseTaskResponse) {
  const normalizedTasksCollection = {};
  const rawTaskData = firebaseTaskResponse?.data || {};

  for (const [taskId, taskInformation] of Object.entries(rawTaskData)) {
    normalizedTasksCollection[taskId] = prepareTaskData(taskId, taskInformation);
  }

  return normalizedTasksCollection;
}

// Prepare individual task with proper structure
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

export async function updateTask(taskDataToUpdate) {
  try {
    await requestData("PUT", `/tasks/${taskDataToUpdate.id}`, taskDataToUpdate);
  } catch (updateError) {
    // Handle task update error silently
  }
}

// Deletes a task from Firebase
export async function deleteTask(taskIdentifierToDelete) {
  await requestData("DELETE", `/tasks/${taskIdentifierToDelete}`);
}

// Handles task fetch errors
export function handleTaskFetchError(errorFromFetch) {
  // Handle task fetch error silently
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
  
  return null;
}
