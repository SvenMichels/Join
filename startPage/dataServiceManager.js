/**
 * @fileoverview Data Service Manager
 * Handles data fetching and task summary updates with retry logic.
 * @module dataServiceManager
 */

import { requestData } from "../scripts/firebase.js";
import { displayDataLoadingState, displayErrorState } from "./loadingStateManager.js";
import { validateTaskData, setTextUpdateSummary } from "./taskStatisticsManager.js";

/**
 * Updates the task summary with retry logic on failure.
 *
 * @param {Object} config - Configuration for retries.
 * @param {number} config.maxRetries - Maximum number of retry attempts.
 * @param {number} config.retryDelayMs - Delay between retries in milliseconds.
 * @returns {Promise<void>}
 */
export async function updateTaskSummaryWithRetryLogic(config = { maxRetries: 3, retryDelayMs: 800 }) {
  displayDataLoadingState();

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const success = await loadAndUpdateSummary();
    if (success) return;

    if (attempt < config.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, config.retryDelayMs));
    }
  }

  displayErrorState();
}

/**
 * Loads tasks from the database and updates the summary.
 *
 * @returns {Promise<boolean>} Returns true if successful, false otherwise.
 */
// TODO: REFACTOR: This function is too large and does too many things. Consider breaking it down into smaller functions.
async function loadAndUpdateSummary() {
  try {
    const response = await requestData("GET", "/tasks/");
    if (!response || typeof response !== "object") return false;

    const tasks = response.data;
    if (!tasks) {
      if (response.hasOwnProperty("data")) {
        setTextUpdateSummary([]);
        return true;
      }
      return false;
    }

    const tasksArray = Object.values(tasks);
    if (!validateTaskData(tasksArray)) return false;

    setTextUpdateSummary(tasksArray);
    return true;
  } catch {
    return false;
  }
}
