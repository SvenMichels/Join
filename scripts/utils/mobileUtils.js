/**
 * Mobile Utilities
 * Hilfsfunktionen für Mobile-Device-Erkennung und -Handling
 */

/**
 * Richtet Mobile-Device-Event-Listener ein
 * Behandelt Rotation-Warnungen bei Orientierungs- und Resize-Events
 */
export function setupMobileDeviceListeners() {
  const handleRotation = () => {
    const warning = document.getElementById("rotateWarning");
    if (!warning) return;
    
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) 
                     || ('ontouchstart' in window && window.innerWidth <= 768);
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    
    warning.style.display = (isMobile && isLandscape) ? "flex" : "none";
  };
  
  window.addEventListener("orientationchange", handleRotation);
  window.addEventListener("resize", handleRotation);
  document.addEventListener("DOMContentLoaded", handleRotation);
}

/**
 * Prüft ob Mobile-Ansicht aktiv ist
 * @returns {boolean} True wenn Bildschirmbreite <= 768px
 */
export function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}