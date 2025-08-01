/**
 * @fileoverview Modal management for task creation and editing
 */

import { changeModalTitleAdd, changeModalTitleEdit } from "./board.js";

/**
 * Initializes modal contents and sets up appropriate mode
 * @param {HTMLElement} overlay - Modal overlay container element
 * @param {boolean} isEdit - Whether modal is in edit mode or create mode
 * @param {Object|null} task - Task data object for editing (null for new tasks)
 */
export async function initModalContents(overlay, isEdit, task) {
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  const init = window.initTaskFloat?.();
  if (init instanceof Promise) await init;

  setModalMode(isEdit, task);
  const form = overlay.querySelector("#taskForm-modal");

  if (isEdit && task && form) {
    prepareEditMode(form, task);
  } else {
    prepareCreateMode(form);
  }

  setupCloseButton(overlay);
}

/**
 * Sets global modal state variables
 * @param {boolean} isEdit - Whether in edit mode
 * @param {Object|null} task - Task object containing id property
 */
function setModalMode(isEdit, task) {
  window.isEditMode = isEdit;
  window.editingTaskId = isEdit && task ? task.id : null;
}

/**
 * Configures modal form for editing existing task
 * @param {HTMLElement} form - Form element to configure
 * @param {Object} task - Task object with id, status, and other properties
 */
function prepareEditMode(form, task) {
  form.dataset.taskId = task.id;
  form.dataset.taskStatus = task.status;

  if (window.prefillModalWithTaskData) {
    window.prefillModalWithTaskData(task);
  }

  const btn = form.querySelector(".create-button");
  if (btn) {
    btn.innerHTML = 'OK <img src="../assets/icons/check.svg">';
    btn.disabled = false;
  }
}

/**
 * Configures modal form for creating new task
 * @param {HTMLElement|null} form - Form element to reset and configure
 */
function prepareCreateMode(form) {
  if (!form) return;
  
  if (window.resetModalFormState) {
    window.resetModalFormState();
  }
  
  resetSubtasks();
  
  if (window.renderSubtasksModal) {
    window.renderSubtasksModal();
  }
}

/**
 * Clears subtask arrays for new task creation
 */
function resetSubtasks() {
  if (window.subtaskItemsListModal) {
    window.subtaskItemsListModal.length = 0;
  }
  if (window.completedSubtasksModal) {
    window.completedSubtasksModal.length = 0;
  }
}

/**
 * Attaches close button event listener to modal
 * @param {HTMLElement} overlay - Modal overlay containing close button
 */
function setupCloseButton(overlay) {
  const closeBtn = overlay.querySelector(".taskFloatButtonClose");
  closeBtn?.addEventListener("click", () => {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  });
}

/**
 * Opens task modal by fetching HTML and initializing contents
 * @param {boolean} [isEdit=false] - Whether to open in edit mode
 * @param {Object|null} [task=null] - Task data for editing
 */
export function openTaskModal(isEdit = false, task = null) {
  const overlay = document.getElementById("modal-overlay");
  console.log("Opening task modal", { isEdit, task });
  
  fetch("../taskFloatData/taskfloat.html")
    .then((res) => res.text())
    .then((html) => {
      overlay.innerHTML = html;
      overlay.classList.remove("d_none");
      initModalContents(overlay, isEdit, task);
      if(task==null) {
        changeModalTitleAdd();
        } else{
          changeModalTitleEdit();}
    });
}

// Make function globally available
window.openTaskModal = openTaskModal;
