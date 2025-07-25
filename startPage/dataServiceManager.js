/**
 * Data Service Manager
 * Verwaltet Datenabruf und Task-Summary-Updates
 */

import { requestData } from "../scripts/firebase.js";
import { displayDataLoadingState, displayErrorState } from "./loadingStateManager.js";
import { validateTaskData, setTextUpdateSummary } from "./taskStatisticsManager.js";

/**
 * Aktualisiert Task-Summary mit Retry-Logik
 * @param {Object} config - Retry-Konfiguration mit maxRetries und retryDelayMs
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
 * Lädt Tasks und aktualisiert Summary
 * @returns {Promise<boolean>} True bei Erfolg, false bei Fehler
 */
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
