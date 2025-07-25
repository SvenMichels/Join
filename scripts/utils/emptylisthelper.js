/**
 * Empty List Helper
 * Verwaltet Empty-State-Placeholder für Task-Listen
 */

const TASK_CONFIGS = [
  { listId: 'todoList', selector: '[data-status="todo"] .empty-placeholder', msg: 'No tasks To do' },
  { listId: 'inProgressList', selector: '[data-status="in-progress"] .empty-placeholder', msg: 'No tasks in Progress' },
  { listId: 'awaitList', selector: '[data-status="await"] .empty-placeholder', msg: 'No tasks Awaiting' },
  { listId: 'doneList', selector: '[data-status="done"] .empty-placeholder', msg: 'No tasks Done' }
];

/**
 * Aktualisiert Empty-State für alle Task-Listen
 */
export function updateEmptyLists() {
  TASK_CONFIGS.forEach(config => {
    const list = document.getElementById(config.listId);
    if (!list) return;
    
    updateListState(list, config);
  });
}

/**
 * Aktualisiert Empty-State einer Liste
 * @param {HTMLElement} list - Liste Element
 * @param {Object} config - Konfiguration mit selector und msg
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
 * Prüft ob Liste Task-Elemente enthält
 * @param {HTMLElement} list - Liste Element
 * @returns {boolean} True wenn Tasks vorhanden
 */
function hasTaskElements(list) {
  return Array.from(list.children).some(child => 
    !child.classList.contains("empty-placeholder")
  );
}

/**
 * Versteckt Empty-State-Anzeige
 * @param {HTMLElement} header - Header Placeholder
 * @param {HTMLElement} dynamic - Dynamic Placeholder
 */
function hideEmptyState(header, dynamic) {
  if (header) header.style.display = "none";
  if (dynamic) dynamic.remove();
}

/**
 * Zeigt Empty-State-Anzeige
 * @param {HTMLElement} header - Header Placeholder
 * @param {HTMLElement} dynamic - Dynamic Placeholder
 * @param {HTMLElement} list - Liste Element
 * @param {string} msg - Anzuzeigende Nachricht
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