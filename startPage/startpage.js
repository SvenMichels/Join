/**
 * Start Page Main Controller
 * Hauptsteuerung für die Start-/Dashboard-Seite
 */

import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { updateUserGreetingDisplay, handleMobileGreetingFadeEffect } from "./userGreetingManager.js";
import { updateTaskSummaryWithRetryLogic } from "./dataServiceManager.js";

/**
 * Initialisiert die Startseite beim Laden
 */
document.addEventListener("DOMContentLoaded", async () => {
  updateUserGreetingDisplay();
  await updateTaskSummaryWithRetryLogic();
  handleMobileGreetingFadeEffect();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
  
  window.addEventListener("focus", refreshData);
  window.addEventListener("pageshow", handlePageShow);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

/**
 * Aktualisiert Daten beim Fokus
 */
async function refreshData() {
  await updateTaskSummaryWithRetryLogic();
}

/**
 * Behandelt PageShow-Event
 * @param {PageTransitionEvent} event - PageShow Event
 */
async function handlePageShow(event) {
  if (event.persisted) {
    await updateTaskSummaryWithRetryLogic();
  }
}

/**
 * Behandelt Sichtbarkeitsänderungen
 */
async function handleVisibilityChange() {
  if (!document.hidden) {
    await updateTaskSummaryWithRetryLogic();
  }
}
