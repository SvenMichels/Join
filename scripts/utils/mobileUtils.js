/**
 * @fileoverview Utility functions for mobile device detection and responsive handling.
 */

/**
 * Sets up listeners for mobile device orientation and screen resizing.
 * Displays a rotation warning if the device is in landscape mode on a small screen.
 */
export function setupMobileDeviceListeners() {
  const handleRotation = () => {
    const warning = document.getElementById("rotateWarning");
    if (!warning) return;

    const isMobile = ("ontouchstart" in window && window.innerWidth <= 768);

    const isLandscape = window.matchMedia("(orientation: landscape)").matches;

    warning.style.display = isMobile && isLandscape ? "flex" : "none";
  };

  window.addEventListener("orientationchange", handleRotation);
  window.addEventListener("resize", handleRotation);
  document.addEventListener("DOMContentLoaded", handleRotation);
}

/**
 * Checks whether the current viewport qualifies as mobile view.
 *
 * @returns {boolean} Returns true if the screen width is 768px or less.
 */
export function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}
