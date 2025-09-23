/**
 * @fileoverview Loading State Manager
 * Manages loading and error display states for UI elements.
 * @module loadingStateManager
 */

const TASK_COUNTER_SELECTORS = [
  ".todoTaskAmount", 
  ".doneTaskAmount", 
  ".taskInProgress", 
  ".awaitingFeedback", 
  ".taskInBoard", 
  ".urgentTaskAmount"
];

/**
 * Displays loading state for both task counters and urgent date.
 */
export function displayDataLoadingState() {
  displayTaskCountersLoadingState();
  displayUrgentDateLoadingState();
}

/**
 * Displays loading state for all task counter fields.
 */
export function displayTaskCountersLoadingState() {
  TASK_COUNTER_SELECTORS.forEach(selector => {
    setElementToLoadingState(selector, "...", "loading loading-dots");
  });
}

/**
 * Displays loading state for the urgent task due date.
 */
export function displayUrgentDateLoadingState() {
  setElementToLoadingState(".urgentTaskDate", "Loading...", "loading");
}

/**
 * Displays error state: shows fallback text and resets values.
 */
export function displayErrorState() {
  displayErrorCounters();
  setText(".urgentTaskDate", "No data");
}

/**
 * Sets all task counters to 0 when loading fails.
 */
export function displayErrorCounters() {
  TASK_COUNTER_SELECTORS.forEach(selector => setText(selector, "0"));
}

/**
 * Updates the text content and class of an element to reflect loading.
 *
 * @param {string} elementSelector - CSS selector for the element.
 * @param {string} loadingText - Text to display while loading.
 * @param {string} loadingClasses - CSS classes to add for loading state.
 */
function setElementToLoadingState(elementSelector, loadingText, loadingClasses) {
  const targetElement = document.querySelector(elementSelector);
  if (!targetElement) return;
  
  targetElement.textContent = loadingText;
  targetElement.className = targetElement.className.replace(" loading", "") + " " + loadingClasses;
}

/**
 * Sets plain text to an element and removes loading classes.
 *
 * @param {string} elementSelector - CSS selector for the target element.
 * @param {string} displayText - Text to set.
 */
export function setText(elementSelector, displayText) {
  const targetElement = document.querySelector(elementSelector);
  if (!targetElement) return;
  
  targetElement.textContent = displayText;
  removeLoadingClasses(targetElement);
}

/**
 * Removes loading-related CSS classes from an element.
 *
 * @param {HTMLElement} htmlElement - The element to clean.
 */
function removeLoadingClasses(htmlElement) {
  htmlElement.className = htmlElement.className
    .replace(" loading", "")
    .replace(" loading-dots", "");
}
