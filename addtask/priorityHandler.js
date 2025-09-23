/**
 * Priority Management for Add Task
 * Handles visual and logical selection of priority options in the Add Task form.
 *
 * @module priorityHandler
 */

import { PRIORITY_ICONS_MODAL } from "../scripts/utils/constants.js";
import { setCurrentPriority } from "./formManager.js";

/**
 * Configuration for each priority level.
 * @type {Object.<string, {buttonId: string, imageId: string, activeClass: string}>}
 */
const PRIORITY_CONFIG = {
  urgent: { buttonId: "urgent-task", imageId: "urgent-task-img", activeClass: "prioUrgentBtnActive" },
  medium: { buttonId: "medium-task", imageId: "medium-task-img", activeClass: "prioMediumBtnActive" },
  low: { buttonId: "low-task", imageId: "low-task-img", activeClass: "prioLowBtnActive" }
};

/**
 * CSS classes for highlighting the active priority button.
 * @type {string[]}
 */
const PRIORITY_CLASSES = ["prioUrgentBtnActive", "prioMediumBtnActive", "prioLowBtnActive"];

/**
 * Selects a priority option and updates visual styling accordingly.
 *
 * @param {string} priority - The priority key to select ('urgent', 'medium', or 'low').
 */
export function selectPriority(priority) {
  setCurrentPriority(priority);
  resetAllPriorityStyles();
  applySelectedPriorityStyle(priority);
}

/**
 * Removes all active priority styles from buttons and resets icon images.
 */
function resetAllPriorityStyles() {
  Object.entries(PRIORITY_CONFIG).forEach(([priorityKey, config]) => {
    const button = document.getElementById(config.buttonId);
    const image = document.getElementById(config.imageId);

    if (button) {
      button.classList.remove(...PRIORITY_CLASSES);
    }
    if (image) {
      image.src = PRIORITY_ICONS_MODAL[priorityKey][0];
    }
  });
}

/**
 * Applies active styling to the selected priority button and updates the icon.
 *
 * @param {string} selectedPriority - The priority key to style ('urgent', 'medium', or 'low').
 */
function applySelectedPriorityStyle(selectedPriority) {
  const config = getPriorityConfig(selectedPriority);
  if (!config) return;

  const elements = getPriorityElements(config);
  updatePriorityElements(elements, selectedPriority, config);
}

/**
 * Gets the configuration for a specific priority.
 * @param {string} priority - The priority key to get config for.
 * @returns {Object|null} Priority configuration or null if not found.
 */
function getPriorityConfig(priority) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) {
    console.warn(`[PriorityHandler] Unknown priority: ${priority}`);
    return null;
  }
  return config;
}

/**
 * Gets the DOM elements for a priority configuration.
 * @param {Object} config - Priority configuration object.
 * @returns {Object} Object containing button and image elements.
 */
function getPriorityElements(config) {
  return {
    button: document.getElementById(config.buttonId),
    image: document.getElementById(config.imageId)
  };
}

/**
 * Updates the priority elements with active styling and icon.
 * @param {Object} elements - Object containing button and image elements.
 * @param {string} priority - The priority key.
 * @param {Object} config - Priority configuration object.
 */
function updatePriorityElements(elements, priority, config) {
  updateButtonStyle(elements.button, config.activeClass);
  updateImageSource(elements.image, priority);
}

/**
 * Updates the button with active styling.
 * @param {HTMLElement|null} button - The button element to update.
 * @param {string} activeClass - The CSS class to add.
 */
function updateButtonStyle(button, activeClass) {
  if (button) {
    button.classList.add(activeClass);
  }
}

/**
 * Updates the image source for the priority icon.
 * @param {HTMLElement|null} image - The image element to update.
 * @param {string} priority - The priority key for icon lookup.
 */
function updateImageSource(image, priority) {
  if (image && PRIORITY_ICONS_MODAL[priority]) {
    image.src = PRIORITY_ICONS_MODAL[priority][1];
  }
}

/**
 * Initializes all event listeners for the priority buttons.
 * Sets default priority and attaches click handlers.
 */
export function initPriorityEventListeners() {
  setDefaultPriority();
  attachPriorityEventHandlers();
}

/**
 * Sets the default priority selection.
 */
function setDefaultPriority() {
  selectPriority("medium");
}

/**
 * Attaches click event handlers to all priority buttons.
 */
function attachPriorityEventHandlers() {
  Object.keys(PRIORITY_CONFIG).forEach(attachSinglePriorityHandler);
}

/**
 * Attaches click event handler to a single priority button.
 * @param {string} priority - The priority key to attach handler for.
 */
function attachSinglePriorityHandler(priority) {
  const config = PRIORITY_CONFIG[priority];
  const button = document.getElementById(config.buttonId);
  
  if (button) {
    button.addEventListener("click", () => selectPriority(priority));
  } else {
    console.warn(`[PriorityHandler] Button not found for priority: ${priority}`);
  }
}
