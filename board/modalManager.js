/**
 * @fileoverview Modal management for task creation and editing
 */

import { changeModalTitleAdd, changeModalTitleEdit } from "./board.js";
import { noScrollTaskDetails } from "./taskDetails.js";

/**
 * Initializes modal contents and sets up appropriate mode
 * @param {HTMLElement} overlay - Modal overlay container element
 * @param {boolean} isEdit - Whether modal is in edit mode or create mode
 * @param {Object|null} task - Task data object for editing (null for new tasks)
 */
export async function initModalContents(overlay, isEdit, task) {
  await waitForNextFrame();
  await maybeInitFloat();

  setModalMode(isEdit, task);

  const form = overlay.querySelector("#taskForm-modal");
  if (!form) return;

  isEdit && task ? prepareEditMode(form, task) : prepareCreateMode(form);
  setupCloseButton(overlay);
}

/**
 * Waits for the next animation frame to ensure DOM updates are complete
 * @returns {Promise<void>} Promise that resolves after the next frame
 */
function waitForNextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * Initializes task float functionality if available
 * Handles both synchronous and asynchronous initialization
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 */
async function maybeInitFloat() {
  const init = window.initTaskFloat?.();
  if (init instanceof Promise) {
    await init;
  }
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
  noScrollTaskDetails(overlay);

  fetch("../taskfloatdata/taskfloat.html")
    .then((res) => res.text())
    .then((html) => {
      overlay.innerHTML = html;
      overlay.classList.remove("d_none");
      initModalContents(overlay, isEdit, task);
      if (task == null) {
        changeModalTitleAdd();
      } else {
        changeModalTitleEdit();
      }
    });
}

/**
 * Attaches a global click listener to close a container element when clicking outside of it.
 *
 * - Prevents multiple bindings by checking `outsideClickHandlerBound`.
 * - Adds a `click` listener to the `document` that checks
 *   whether the click happened outside the given container.
 * - If the click is outside, the `"open"` CSS class
 *   is removed from the container, effectively closing it.
 *
 * Requirements:
 * - A global variable `outsideClickHandlerBound` must exist
 *   to prevent multiple listener registrations.
 *
 * @function bindOutsideClickToClose
 * @param {HTMLElement} container - The container element to be closed when clicking outside of it.
 * @returns {void} This function does not return a value.
 */
export function bindOutsideClickToClose(container) {
  if (window.outsideClickHandlerBound) {
    return;
  }

  window.outsideClickHandlerBound = true;
  
  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) {
      container.classList.remove('open');
    }
  });
}

window.openTaskModal = openTaskModal;
