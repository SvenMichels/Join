/**
 * @fileoverview Entry point for initializing page behaviors.
 * Handles startup logo animation and sets up mobile device listeners.
 * @module init
 */

import { setupMobileDeviceListeners } from "./scripts/utils/mobileUtils.js";
import { LocalStorageService } from "./scripts/utils/localStorageHelper.js";

/**
 * Clears the current user data from local storage if it exists.
 * @returns {void}
 */
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
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(min-width: 991px)").matches) {
    const fullscreen = document.querySelector(".logo-fullscreen");
    const animLogo = document.querySelector(".logo-anim");
    const finalLogo = document.querySelector(".logo-final");

    if (!fullscreen || !animLogo || !finalLogo) return;
    finalLogo.style.visibility = "hidden";
    finalLogo.classList.remove("d-none");

    requestAnimationFrame(() => {
      const startRect = animLogo.getBoundingClientRect();
      const endRect = finalLogo.getBoundingClientRect();

      const deltaX = endRect.left - startRect.left;
      const deltaY = endRect.top - startRect.top;
      const scaleX = endRect.width / startRect.width;
      const scaleY = endRect.height / startRect.height;

      animLogo.animate(
        [
          {
            transform: `translate(0px, 0px) scale(1, 1)`,
            opacity: 1,
          },
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
            opacity: 0,
          },
        ],
        {
          duration: 2000,
          easing: "ease-in-out",
          fill: "forwards",
        }
      ).onfinish = () => {
        fullscreen.style.transition = "background-color 0.6s ease";
        fullscreen.style.backgroundColor = "transparent";

        setTimeout(() => {
          fullscreen.classList.add("d-none");
          finalLogo.style.visibility = "visible";
        }, 0);
        setupMobileDeviceListeners();
        clearCurrentUser();
      };
    });
  }
});
