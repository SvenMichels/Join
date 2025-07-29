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
  const config = PRIORITY_CONFIG[selectedPriority];
  if (!config) return;

  const button = document.getElementById(config.buttonId);
  const image = document.getElementById(config.imageId);

  if (button) {
    button.classList.add(config.activeClass);
  }
  if (image) {
    image.src = PRIORITY_ICONS_MODAL[selectedPriority][1];
  }
}

/**
 * Initializes all event listeners for the priority buttons.
 * On click, the corresponding priority is selected.
 */
export function initPriorityEventListeners() {
  Object.keys(PRIORITY_CONFIG).forEach(priority => {
    const config = PRIORITY_CONFIG[priority];
    const button = document.getElementById(config.buttonId);
    button?.addEventListener("click", () => selectPriority(priority));
  });
}
