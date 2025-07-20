// Mobile device detection
export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 820;
  
  return isMobileUserAgent || (hasTouchSupport && isSmallScreen);
}

// Check if device is in landscape mode
export function isLandscapeMode() {
  return window.matchMedia("(orientation: landscape)").matches;
}

// Show/hide rotation warning
export function toggleRotateWarning() {
  const warning = document.getElementById("rotateWarning");
  if (!warning) return;
  
  const shouldShow = isMobileDevice() && isLandscapeMode();
  warning.style.display = shouldShow ? "flex" : "none";
}

/**
 * Sets up event listeners for mobile device orientation changes
 * Automatically handles rotation warnings on orientation and resize events
 */
export function setupMobileDeviceListeners() {
  window.addEventListener("orientationchange", toggleRotateWarning);
  window.addEventListener("resize", toggleRotateWarning);
  document.addEventListener("DOMContentLoaded", toggleRotateWarning);
}

export function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches
}