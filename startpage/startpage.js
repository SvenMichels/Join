/**
 * @fileoverview Start Page Main Controller
 * Manages the initialization and update logic for the dashboard/start page.
 * @module startpageController
 */

import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { updateUserGreetingDisplay, handleMobileGreetingFadeEffect } from "./userGreetingManager.js";
import { updateTaskSummaryWithRetryLogic } from "./dataServiceManager.js";

/**
 * Initializes the start page on DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", async () => {
  updateUserGreetingDisplay();
  await updateTaskSummaryWithRetryLogic();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
  handleMobileGreetingFadeEffect();
  window.addEventListener("focus", refreshData);
  window.addEventListener("pageshow", handlePageShow);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

/**
 * Refreshes data when window gains focus.
 * @returns {Promise<void>}
 */
async function refreshData() {
  await updateTaskSummaryWithRetryLogic();
}

/**
 * Handles the pageshow event to refresh data when loaded from bfcache.
 * 
 * @param {PageTransitionEvent} event - The pageshow event.
 * @returns {Promise<void>}
 */
async function handlePageShow(event) {
  if (event.persisted) {
    await updateTaskSummaryWithRetryLogic();
  }
}

/**
 * Handles visibility changes to refresh data when tab becomes active.
 * @returns {Promise<void>}
 */
async function handleVisibilityChange() {
  if (!document.hidden) {
    await updateTaskSummaryWithRetryLogic();
  }
}
