/* Modal management for tasks */

// Initialize modal for task creation/editing
export async function initModalContents(overlay, isEdit, task) {
  const init = window.initTaskFloat?.();
  if (init instanceof Promise) await init;

  setModalMode(isEdit, task);
  const form = overlay.querySelector("#taskForm-modal");

  if (isEdit && task && form) {
    prepareModalFormForEdit(form, task);
  }

  setupModalCloseButton(overlay);
}

function setModalMode(isEdit, task) {
  window.isEditMode = isEdit;
  window.editingTaskId = isEdit && task ? task.id : null;
}

/**
 * Prepares modal form for editing existing task
 * @param {HTMLElement} form - Form element
 * @param {Object} task - Task data
 */
function prepareModalFormForEdit(form, task) {
  form.dataset.taskId = task.id;
  form.dataset.taskStatus = task.status;

  if (window.prefillModalWithTaskData) {
    window.prefillModalWithTaskData(task);
  }

  const okBtn = form.querySelector(".create-button");
  if (okBtn) {
    okBtn.innerHTML = 'OK <img src="../assets/icons/check.svg">';
    okBtn.disabled = false;
  }
}

/**
 * Sets up modal close button functionality
 * @param {HTMLElement} overlay - Modal overlay element
 */
function setupModalCloseButton(overlay) {
  const closeBtn = overlay.querySelector(".taskFloatButtonClose");
  closeBtn?.addEventListener("click", () => {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  });
}

/**
 * Opens task modal for creation or editing
 * @param {boolean} isEdit - Whether in edit mode
 * @param {Object|null} task - Task data for editing
 */
export function openTaskModal(isEdit = false, task = null) {
  const overlay = document.getElementById("modal-overlay");
  
  fetch("../taskFloatData/taskfloat.html")
    .then((res) => res.text())
    .then((html) => {
      overlay.innerHTML = html;
      overlay.classList.remove("d_none");
      initModalContents(overlay, isEdit, task);
    });
}

// Make function globally available
window.openTaskModal = openTaskModal;
