import { toArray } from "../scripts/utils/taskUtils.js";
import {
  getCategoryIcon,
  getPriorityIcon,
  generateAssignedChips
} from "./boardUtils.js";
import { deleteTask, updateTask } from "./taskManager.js";

export async function renderTaskDetailData(task, allUsers) {
  renderTaskDetailIcon(task.category);
  renderTaskDetailText(task);
  renderTaskDetailPriority(task.prio);
  await renderTaskDetailAssignees(task.assignedUsers, allUsers);
  renderTaskDetailSubtasks(task.subtasks, task.subtaskDone);

  if (typeof renderSubtasksInModal === "function") {
    renderSubtasksInModal(task);
  }

  setupEditAndDelete(task);
  initSubtaskProgress(null, task);
}

/**
 * Renders task category icon
 * @param {string} category - Task category
 */
function renderTaskDetailIcon(category) {
  const iconEl = document.querySelector("#detail-icon");
  if (!iconEl) return;

  iconEl.src = getCategoryIcon(category);
  iconEl.alt = category || "Task Icon";
}

/**
 * Renders task text information
 * @param {Object} task - Task object
 */
function renderTaskDetailText(task) {
  const titleEl = document.querySelector("#task-detail-title");
  const descEl = document.querySelector("#detail-description");
  const dateEl = document.querySelector("#task-detail-due-date");

  if (titleEl) titleEl.textContent = task.title;
  if (descEl) descEl.textContent = task.description;
  if (dateEl) dateEl.textContent = task.dueDate;
}

/**
 * Renders task priority
 * @param {string} prio - Priority level
 */
function renderTaskDetailPriority(prio) {
  const prioEl = document.querySelector("#task-detail-priority");
  if (prioEl) {
    prioEl.innerHTML = getPriorityIcon(prio);
  }
}

/**
 * Renders assigned users
 * @param {Array} assigned - Assigned users
 * @param {Array} allUsers - All users array
 */
async function renderTaskDetailAssignees(assigned, allUsers) {
  const assignedEl = document.querySelector("#task-detail-assigned");
  if (assignedEl) {
    assignedEl.innerHTML = await generateAssignedChips(
      toArray(assigned),
      allUsers,
      true
    );
  }
}

/**
 * Renders subtasks list
 * @param {Array} subtasks - Subtasks array
 * @param {Array} subtaskDone - Completion status array
 */
function renderTaskDetailSubtasks(subtasks = [], subtaskDone = []) {
  const subtasksEl = document.querySelector("#task-detail-subtasks");
  if (!subtasksEl) return;

  const subtasksHtml = subtasks.map((txt, i) => {
    const isChecked = subtaskDone?.[i] ? "checked" : "";
    return `
      
        <input type="checkbox" id="sub-${i}" class="subtask-checkbox" ${isChecked}>
        <label for="sub-${i}">${txt}</label>${`<br class="m12-t">`}`;
  }).join("");

  subtasksEl.innerHTML = subtasksHtml;
}

/**
 * Sets up edit and delete button functionality
 * @param {Object} task - Task object
 */
function setupEditAndDelete(task) {
  const editBtn = document.querySelector(".edit-btn");
  const deleteBtn = document.querySelector(".delete-btn");

  setupEditButton(editBtn, task);
  setupDeleteButton(deleteBtn, task);
}

function setupEditButton(button, task) {
  if (!button || !window.openTaskModal) return;

  button.addEventListener("click", () => {
    window.openTaskModal(true, task);
  });
}

function setupDeleteButton(button, task) {
  if (!button) return;

  button.addEventListener("click", async () => {
    await deleteTask(task.id);
    closeDetailModal();
    if (window.fetchTasks) window.fetchTasks();
  });
}

/**
 * Closes the detail modal
 */
function closeDetailModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("d_none");
  overlay.innerHTML = "";
  document.body.classList.remove("no-scroll");
}

/**
 * Opens task details modal
 * @param {Object} task - Task object
 */
export async function openTaskDetails(task) {
  const overlay = document.getElementById("modal-overlay");
  resetOverlay(overlay);

  const modalHTML = await fetchModalHTML("../edittask/taskdetail.html");
  overlay.innerHTML = modalHTML;

  const allUsers = typeof window.allUsers === 'function' ? window.allUsers() : window.allUsers || [];
  await renderTaskDetailData(task, allUsers);

  const modal = overlay.querySelector("#taskDetailModal");
  noScrollTaskDetails(modal);
  setupCloseButton(modal, overlay);
  setupOutsideClickHandler(modal, overlay);
}

function noScrollTaskDetails(modal) {
  if (modal) {
    document.body.classList.add("no-scroll");
  } else {
    removeNoScroll();
  }

}

/**
 * Resets modal overlay
 * @param {HTMLElement} overlay - Overlay element
 */
function resetOverlay(overlay) {
  overlay.innerHTML = "";
  overlay.classList.remove("d_none");
}

/**
 * Fetches modal HTML from path
 * @param {string} path - HTML file path
 * @returns {Promise<string>} HTML content
 */
async function fetchModalHTML(path) {
  const res = await fetch(path);
  return await res.text();
}

/**
 * Sets up close button functionality
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} overlay - Overlay element
 */
function setupCloseButton(modal, overlay) {
  const closeBtn = modal.querySelector(".taskDetailCloseButton");
  closeBtn?.addEventListener("click", async () => {
    closeOverlay(overlay);
    removeNoScroll();
    if (window.fetchTasks) await window.fetchTasks();
  });
}

export function removeNoScroll() {
  document.body.classList.remove("no-scroll");
}

/**
 * Sets up outside click handler
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} overlay - Overlay element
 */
export function setupOutsideClickHandler(modal, overlay) {
  const handler = (event) => {
    const clickedInside = event.composedPath().includes(modal);
    const clickedOverlay = event.target === overlay;

    if (clickedInside || !clickedOverlay) return;

    closeOverlay(overlay);
    removeNoScroll();
    overlay.removeEventListener("click", handler);
    if (window.fetchTasks) window.fetchTasks();
  };
  overlay.addEventListener("click", handler);
}

/**
 * Closes overlay
 * @param {HTMLElement} overlay - Overlay element
 */
function closeOverlay(overlay) {
  overlay.classList.add("d_none");
  removeNoScroll();
}

// Make function globally available
window.openTaskDetails = openTaskDetails;
