/**
 * @fileoverview Manages empty state placeholders for all task lists.
 */

/**
 * Configuration mapping for all task status columns.
 * @constant {Array<Object>}
 */
const TASK_CONFIGS = [
  { listId: 'todoList', selector: '[data-status="todo"] .empty-placeholder', msg: 'No tasks To do' },
  { listId: 'inProgressList', selector: '[data-status="in-progress"] .empty-placeholder', msg: 'No tasks in Progress' },
  { listId: 'awaitList', selector: '[data-status="await"] .empty-placeholder', msg: 'No tasks Awaiting' },
  { listId: 'doneList', selector: '[data-status="done"] .empty-placeholder', msg: 'No tasks Done' }
];

/**
 * Updates all task lists with proper empty state placeholders if no tasks are present.
 * This function should be called after rendering or modifying tasks.
 */
export function updateEmptyLists() {
  TASK_CONFIGS.forEach(config => {
    const list = document.getElementById(config.listId);
    if (!list) return;

    updateListState(list, config);
  });
}

/**
 * Updates the empty state of a specific list based on task presence.
 * 
 * @param {HTMLElement} list - The DOM element of the task list.
 * @param {Object} config - Configuration object for the list.
 * @param {string} config.selector - CSS selector for static empty placeholder.
 * @param {string} config.msg - Message to show in the empty state.
 */
function updateListState(list, config) {
  const headerPlaceholder = document.querySelector(config.selector);
  const dynamicPlaceholder = list.querySelector(".empty-placeholder");
  const hasTasks = hasTaskElements(list);

  if (hasTasks) {
    hideEmptyState(headerPlaceholder, dynamicPlaceholder);
  } else {
    showEmptyState(headerPlaceholder, dynamicPlaceholder, list, config.msg);
  }
}

/**
 * Checks if a list contains any task elements (excluding placeholders).
 * 
 * @param {HTMLElement} list - The DOM element of the task list.
 * @returns {boolean} True if the list contains tasks, false otherwise.
 */
function hasTaskElements(list) {
  return Array.from(list.children).some(child =>
    !child.classList.contains("empty-placeholder")
  );
}

/**
 * Hides both static and dynamic empty state placeholders.
 * 
 * @param {HTMLElement|null} header - The static header placeholder element.
 * @param {HTMLElement|null} dynamic - The dynamic placeholder element inside the list.
 */
function hideEmptyState(header, dynamic) {
  if (header) header.style.display = "none";
  if (dynamic) dynamic.remove();
}

/**
 * Shows an empty state placeholder if no tasks are present in the list.
 * 
 * @param {HTMLElement|null} header - The static header placeholder element.
 * @param {HTMLElement|null} dynamic - The current dynamic placeholder element.
 * @param {HTMLElement} list - The task list DOM element.
 * @param {string} msg - The message to show in the placeholder.
 */
function showEmptyState(header, dynamic, list, msg) {
  if (header) header.style.display = "";

  if (!dynamic) {
    const placeholder = document.createElement("div");
    placeholder.className = "empty-placeholder";
    placeholder.textContent = msg;
    list.appendChild(placeholder);
  }
}
