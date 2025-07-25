/**
 * Priority Management for Task Modal
 * Verwaltung der Task-Prioritäten
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
 * Gibt die aktuell ausgewählte Priorität zurück
 * @returns {string} Aktuell ausgewählte Priorität
 */
export function getCurrentPriority() {
  return currentlySelectedPriorityModal;
}

/**
 * Wählt eine Priorität aus und aktualisiert die UI
 * @param {string} priorityLevel - Prioritätslevel (urgent, medium, low)
 */
export function selectPriorityModal(priorityLevel) {
  currentlySelectedPriorityModal = priorityLevel;
  resetAllPriorityStates();
  activateSelectedPriority(priorityLevel);
}

/**
 * Setzt alle Prioritäts-Zustände zurück
 */
function resetAllPriorityStates() {
  Object.values(PRIORITY_CONFIG).forEach(config => {
    resetPriorityElement(config);
  });
}

/**
 * Setzt ein einzelnes Prioritäts-Element zurück
 * @param {Object} config - Prioritäts-Konfiguration
 */
function resetPriorityElement(config) {
  const { id, icon, className } = config;
  
  removeActiveClass(id, className);
  setDefaultIcon(id, icon[0]);
}

/**
 * Entfernt aktive CSS-Klasse von einem Element
 * @param {string} elementId - Element-ID
 * @param {string} activeClass - Zu entfernende CSS-Klasse
 */
function removeActiveClass(elementId, activeClass) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove(activeClass);
  }
}

/**
 * Setzt das Standard-Icon für ein Element
 * @param {string} elementId - Element-ID
 * @param {string} defaultIcon - Standard-Icon-URL
 */
function setDefaultIcon(elementId, defaultIcon) {
  const imageId = getImageId(elementId);
  const imageElement = document.getElementById(imageId);
  if (imageElement) {
    imageElement.src = defaultIcon;
  }
}

/**
 * Aktiviert die ausgewählte Priorität
 * @param {string} priorityLevel - Prioritätslevel
 */
function activateSelectedPriority(priorityLevel) {
  const config = PRIORITY_CONFIG[priorityLevel];
  if (!config) return;
  
  const { id, icon, className } = config;
  
  addActiveClass(id, className);
  setActiveIcon(id, icon[1]);
}

/**
 * Fügt aktive CSS-Klasse zu einem Element hinzu
 * @param {string} elementId - Element-ID
 * @param {string} activeClass - Hinzuzufügende CSS-Klasse
 */
function addActiveClass(elementId, activeClass) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(activeClass);
  }
}

/**
 * Setzt das aktive Icon für ein Element
 * @param {string} elementId - Element-ID
 * @param {string} activeIcon - Aktive Icon-URL
 */
function setActiveIcon(elementId, activeIcon) {
  const imageId = getImageId(elementId);
  const imageElement = document.getElementById(imageId);
  if (imageElement) {
    imageElement.src = activeIcon;
  }
}

/**
 * Generiert die Image-ID aus der Element-ID
 * @param {string} elementId - Element-ID
 * @returns {string} Image-Element-ID
 */
function getImageId(elementId) {
  return `${elementId.replace("-task-modal", "")}-task-img-modal`;
}

/**
 * Initialisiert Event-Listener für Prioritäts-Buttons
 */
export function initPriorityEventListeners() {
  attachUrgentListener();
  attachMediumListener();
  attachLowListener();
}

/**
 * Bindet Event-Listener für Urgent-Button
 */
function attachUrgentListener() {
  const urgentBtn = document.getElementById("urgent-task-modal");
  urgentBtn?.addEventListener("click", () => selectPriorityModal("urgent"));
}

/**
 * Bindet Event-Listener für Medium-Button
 */
function attachMediumListener() {
  const mediumBtn = document.getElementById("medium-task-modal");
  mediumBtn?.addEventListener("click", () => selectPriorityModal("medium"));
}

/**
 * Bindet Event-Listener für Low-Button
 */
function attachLowListener() {
  const lowBtn = document.getElementById("low-task-modal");
  lowBtn?.addEventListener("click", () => selectPriorityModal("low"));
}
