/**
 * @fileoverview Entry point for initializing page behaviors.
 * Handles the startup logo animation and sets up mobile device listeners.
 * @module init
 */

import { setupMobileDeviceListeners } from "./scripts/utils/mobileUtils.js";
import { clearCurrentUser } from "./scripts/events/logoutevent.js";

/**
 * Configuration constants for the startup logo animation.
 * @constant {Object}
 * @property {number} minDesktopWidth - Minimum viewport width (in px) for triggering the animation.
 * @property {number} translateOffsetX - Horizontal offset for the logo translation.
 * @property {number} translateOffsetY - Vertical offset for the logo translation.
 * @property {number} animationDuration - Animation duration in milliseconds.
 * @property {string} animationEasing - CSS easing function for the animation.
 * @property {string} backgroundFadeTime - Transition duration for fading out the fullscreen background.
 */
const LOGO_CONFIG = {
  minDesktopWidth: 991,
  translateOffsetX: 86,
  translateOffsetY: 106,
  animationDuration: 2000,
  animationEasing: "ease-in-out",
  backgroundFadeTime: "0.6s",
};

/**
 * Shorthand query selector utility.
 * @param {string} selector - A valid CSS selector string.
 * @returns {Element|null} The first matching element or null if none found.
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Initializes the startup logo animation once the DOM content is fully loaded.
 * Only triggers on desktop viewports (based on {@link LOGO_CONFIG.minDesktopWidth}).
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", handleLogoAnimationInit);

/**
 * Handles initialization of the startup logo animation.
 * Validates viewport size and required DOM elements before animation starts.
 * @returns {void}
 */
function handleLogoAnimationInit() {
  if (!window.matchMedia(`(min-width: ${LOGO_CONFIG.minDesktopWidth}px)`).matches) return;

  const fullscreenLogo = $(".logo-fullscreen");
  const animatedLogo = $(".logo-anim");
  const finalLogo = $(".logo-final");
  if (!fullscreenLogo || !animatedLogo || !finalLogo) return;

  finalLogo.style.visibility = "hidden";
  finalLogo.classList.remove("d-none");
  requestAnimationFrame(() => startLogoAnimation(fullscreenLogo, animatedLogo, finalLogo));
}

/**
 * Starts the logo animation sequence by calculating transformation values
 * and triggering a smooth scale-and-translate effect.
 * @param {HTMLElement} fullscreenLogo - The fullscreen container element.
 * @param {HTMLElement} animatedLogo - The logo element that will animate.
 * @param {HTMLElement} finalLogo - The static final logo element.
 * @returns {void}
 */
function startLogoAnimation(fullscreenLogo, animatedLogo, finalLogo) {
  const startRect = animatedLogo.getBoundingClientRect();
  const endRect = finalLogo.getBoundingClientRect();
  const transform = calculateTransformValues(startRect, endRect);

  animatedLogo
    .animate(getKeyframes(transform), getAnimationOptions())
    .onfinish = () => finishLogoAnimation(fullscreenLogo, finalLogo);
}

/**
 * Calculates translation and scaling values required to morph
 * the animated logo into its final position and size.
 * @param {DOMRect} startRect - The bounding rectangle of the animated logo.
 * @param {DOMRect} endRect - The bounding rectangle of the final logo.
 * @returns {{deltaX: number, deltaY: number, scaleX: number, scaleY: number}} Calculated transformation data.
 */
function calculateTransformValues(startRect, endRect) {
  return {
    deltaX: endRect.left - startRect.left - LOGO_CONFIG.translateOffsetX,
    deltaY: endRect.top - startRect.top - LOGO_CONFIG.translateOffsetY,
    scaleX: endRect.width / startRect.width,
    scaleY: endRect.height / startRect.height,
  };
}

/**
 * Creates the keyframe definitions for the logo animation.
 * @param {Object} transform - Transformation values (deltaX, deltaY, scaleX, scaleY).
 * @returns {Keyframe[]} An array of keyframes for the Web Animations API.
 */
function getKeyframes({ deltaX, deltaY, scaleX, scaleY }) {
  return [
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`, opacity: 1 },
  ];
}

/**
 * Returns configuration options for the logo animation.
 * @returns {KeyframeAnimationOptions} Animation options for duration, easing, and fill mode.
 */
function getAnimationOptions() {
  return {
    duration: LOGO_CONFIG.animationDuration,
    easing: LOGO_CONFIG.animationEasing,
    fill: "forwards",
  };
}

/**
 * Finalizes the animation by fading out the fullscreen container
 * and revealing the final static logo. Also triggers mobile setup
 * and user session cleanup.
 * @param {HTMLElement} fullscreenLogo - The fullscreen container element.
 * @param {HTMLElement} finalLogo - The final static logo element.
 * @returns {void}
 */
function finishLogoAnimation(fullscreenLogo, finalLogo) {
  fullscreenLogo.style.transition = `background-color ${LOGO_CONFIG.backgroundFadeTime} ease`;
  fullscreenLogo.style.backgroundColor = "transparent";

  setTimeout(() => {
    fullscreenLogo.classList.add("d-none");
    finalLogo.style.visibility = "visible";
  }, 0);

  setupMobileDeviceListeners();
  clearCurrentUser();
}