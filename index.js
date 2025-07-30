/**
 * @fileoverview Entry point for initializing page behaviors.
 * Handles startup logo animation and sets up mobile device listeners.
 * @module init
 */

import { setupMobileDeviceListeners } from "./scripts/utils/mobileUtils.js";

/**
 * Handles the animation for the fullscreen startup logo.
 * Shrinks the logo and removes it from the DOM after animation completes.
 * @private
 */
function handleStartupLogoAnimation() {
  const mainLogoElement = document.querySelector(".logo-fullscreen");
  if (!mainLogoElement) return;

  mainLogoElement.classList.add("shrink");
  mainLogoElement.addEventListener("animationend", () => {
    mainLogoElement.remove();
  });
}

/**
 * Initializes the page by triggering startup animations
 * and setting up mobile-related event listeners.
 */
window.addEventListener("DOMContentLoaded", () => {
  handleStartupLogoAnimation();
  setupMobileDeviceListeners();
});
