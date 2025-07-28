import { setupMobileDeviceListeners } from "./scripts/utils/mobileUtils.js";

// Handle logo animation sequence on page load
function handleStartupLogoAnimation() {
  const mainLogoElement = document.querySelector(".logo-fullscreen");
  if (!mainLogoElement) return;

  mainLogoElement.classList.add("shrink");
  mainLogoElement.addEventListener("animationend", () => {
    mainLogoElement.remove();
  });
}

// Initialize page functionality
window.addEventListener("DOMContentLoaded", () => {
  handleStartupLogoAnimation();
  setupMobileDeviceListeners();
});

