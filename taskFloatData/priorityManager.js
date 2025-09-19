/**
 * @fileoverview Priority management for the task modal, including state control and event binding
 * @module priorityModalManager
 */

import { PRIORITY_ICONS_MODAL } from "../scripts/utils/constants.js";

const PRIORITY_CONFIG = {
  urgent: {
    id: "urgent-task-modal",
    icon: PRIORITY_ICONS_MODAL.urgent,
    className: "prioUrgentBtnActive",
  },
  medium: {
    id: "medium-task-modal",
    icon: PRIORITY_ICONS_MODAL.medium,
    className: "prioMediumBtnActive",
  },
  low: {
    id: "low-task-modal",
    icon: PRIORITY_ICONS_MODAL.low,
    className: "prioLowBtnActive",
  },
};

let currentlySelectedPriorityModal = "medium";

/**
 * Returns the currently selected priority
 * @returns {string} Currently selected priority
 */
export function getCurrentPriority() {
  return currentlySelectedPriorityModal;
}

/**
 * Selects a priority level and updates the UI accordingly
 * @param {string} priorityLevel - Priority level ("urgent", "medium", "low")
 */
export function selectPriorityModal(priorityLevel) {
  currentlySelectedPriorityModal = priorityLevel;
  resetAllPriorityStates();
  activateSelectedPriority(priorityLevel);
}

/**
 * Resets the state for all priority buttons
 */
function resetAllPriorityStates() {
  Object.values(PRIORITY_CONFIG).forEach(config => {
    resetPriorityElement(config);
  });
}

/**
 * Resets a single priority button to its default state
 * @param {Object} config - Priority configuration object
 */
function resetPriorityElement(config) {
  const { id, icon, className } = config;

  removeActiveClass(id, className);
  setDefaultIcon(id, icon[0]);
}

/**
 * Removes the active CSS class from a priority button
 * @param {string} elementId - DOM element ID
 * @param {string} activeClass - Class to remove
 */
function removeActiveClass(elementId, activeClass) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove(activeClass);
  }
}

/**
 * Sets the default (inactive) icon for a priority button
 * @param {string} elementId - DOM element ID
 * @param {string} defaultIcon - Path to the default icon
 */
function setDefaultIcon(elementId, defaultIcon) {
  const imageId = getImageId(elementId);
  const imageElement = document.getElementById(imageId);
  if (imageElement) {
    imageElement.src = defaultIcon;
  }
}

/**
 * Activates the selected priority visually and functionally
 * @param {string} priorityLevel - Priority level to activate
 */
function activateSelectedPriority(priorityLevel) {
  const config = PRIORITY_CONFIG[priorityLevel];
  if (!config) return;

  const { id, icon, className } = config;
  console.log(config);


  addActiveClass(id, className);
  setActiveIcon(id, icon[1]);
}

/**
 * Adds the active class to a priority button
 * @param {string} elementId - DOM element ID
 * @param {string} activeClass - Class to add
 */
export function addActiveClass(elementId, activeClass) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(activeClass);
  }
}

/**
 * Sets the active (highlighted) icon for a priority button
 * @param {string} elementId - DOM element ID
 * @param {string} activeIcon - Path to the active icon
 */
export function setActiveIcon(elementId, activeIcon) {
  const imageId = getImageId(elementId);
  const imageElement = document.getElementById(imageId);
  if (imageElement) {
    imageElement.src = activeIcon;
  }
}

/**
 * Derives the image element ID from a given button element ID
 * @param {string} elementId - Priority button element ID
 * @returns {string} The corresponding image element ID
 */
function getImageId(elementId) {
  return `${elementId.replace("-task-modal", "")}-task-img-modal`;
}

/**
 * Initializes event listeners for all priority buttons in the modal
 */
export function initPriorityEventListeners() {
  attachUrgentListener();
  attachMediumListener();
  attachLowListener();
}

/**
 * Adds click event listener for the "urgent" priority button
 */
function attachUrgentListener() {
  const urgentBtn = document.getElementById("urgent-task-modal");
  urgentBtn?.addEventListener("click", () => selectPriorityModal("urgent"));
}

/**
 * Adds click event listener for the "medium" priority button
 */
function attachMediumListener() {
  const mediumBtn = document.getElementById("medium-task-modal");
  mediumBtn?.addEventListener("click", () => selectPriorityModal("medium"));
}

/**
 * Adds click event listener for the "low" priority button
 */
function attachLowListener() {
  const lowBtn = document.getElementById("low-task-modal");
  lowBtn?.addEventListener("click", () => selectPriorityModal("low"));
}
