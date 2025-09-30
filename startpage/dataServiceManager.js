/**
 * @fileoverview Data Service Manager
 * Handles data fetching and task summary updates with retry logic.
 * @module dataServiceManager
 */

import { requestData } from "../scripts/firebase.js";
import { displayDataLoadingState, displayErrorState } from "./loadingStateManager.js";
import { validateTaskData, setTextUpdateSummary } from "../../startpage/taskStatisticsManager.js";

/**
 * Updates the task summary with retry logic on failure.
 *
 * @param {Object} config - Configuration for retries.
 * @param {number} config.maxRetries - Maximum number of retry attempts.
 * @param {number} config.retryDelayMs - Delay between retries in milliseconds.
 * @returns {Promise<void>}
 */
export async function updateTaskSummaryWithRetryLogic(config = { maxRetries: 1, retryDelayMs: 1200 }) {
  displayDataLoadingState();

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const success = await loadAndUpdateSummary();
    if (success) return;
  }

  displayErrorState();
}

/**
 * Loads tasks from the database and updates the summary.
 *
 * @returns {Promise<boolean>} Returns true if successful, false otherwise.
 */
async function loadAndUpdateSummary() {
  try {
    const { data } = await requestData("GET", "/tasks/") || {};
    if (!data) return handleEmptyData();

    const tasksArray = Object.values(data);
    if (!validateTaskData(tasksArray)) return false;

    setTextUpdateSummary(tasksArray);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handles the case when no data is available.
 *
 * - Resets the text update summary to an empty state.
 * - Returns `true` as a confirmation flag.
 *
 * @returns {boolean} Always returns `true` after handling.
 */
function handleEmptyData() {
  setTextUpdateSummary([]);
  return true;
}