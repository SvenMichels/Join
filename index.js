/**
 * @fileoverview Entry point for initializing page behaviors.
 * Handles startup logo animation and sets up mobile device listeners.
 * @module init
 */

import { setupMobileDeviceListeners } from "./scripts/utils/mobileUtils.js";
import { LocalStorageService } from "./scripts/utils/localStorageHelper.js";

function clearCurrentUser() {
  const currentUser = LocalStorageService.getItem("currentUser");
  if (currentUser) {
    LocalStorageService.clearItem("currentUser");
  }
}

/**
 * Initializes the page by triggering startup animations
 * and setting up mobile-related event listeners.
 */
window.addEventListener("DOMContentLoaded", () => {
  setupMobileDeviceListeners();
  clearCurrentUser();
});