/**
 * Priority Management for Add Task
 * Verwaltung der Prioritäten im Add Task Formular
 */

import { PRIORITY_ICONS_MODAL } from "../scripts/utils/constants.js";
import { setCurrentPriority } from "./formManager.js";

const PRIORITY_CONFIG = {
  urgent: { buttonId: "urgent-task", imageId: "urgent-task-img", activeClass: "prioUrgentBtnActive" },
  medium: { buttonId: "medium-task", imageId: "medium-task-img", activeClass: "prioMediumBtnActive" },
  low: { buttonId: "low-task", imageId: "low-task-img", activeClass: "prioLowBtnActive" }
};

const PRIORITY_CLASSES = ["prioUrgentBtnActive", "prioMediumBtnActive", "prioLowBtnActive"];

export function selectPriority(priority) {
  setCurrentPriority(priority);
  resetAllPriorityStyles();
  applySelectedPriorityStyle(priority);
}

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

export function initPriorityEventListeners() {
  Object.keys(PRIORITY_CONFIG).forEach(priority => {
    const config = PRIORITY_CONFIG[priority];
    const button = document.getElementById(config.buttonId);
    button?.addEventListener("click", () => selectPriority(priority));
  });
}
