/**
 * Loading State Manager
 * Verwaltet Loading-Zustände für UI-Elemente
 */

const TASK_COUNTER_SELECTORS = [
  ".todoTaskAmount", 
  ".doneTaskAmount", 
  ".taskInProgress", 
  ".awaitingFeedback", 
  ".taskInBoard", 
  ".urgentTaskAmount"
];

export function displayDataLoadingState() {
  displayTaskCountersLoadingState();
  displayUrgentDateLoadingState();
}

export function displayTaskCountersLoadingState() {
  TASK_COUNTER_SELECTORS.forEach(selector => {
    setElementToLoadingState(selector, "...", "loading loading-dots");
  });
}

export function displayUrgentDateLoadingState() {
  setElementToLoadingState(".urgentTaskDate", "Loading...", "loading");
}

export function displayErrorState() {
  displayErrorCounters();
  setText(".urgentTaskDate", "No data");
}

export function displayErrorCounters() {
  TASK_COUNTER_SELECTORS.forEach(selector => setText(selector, "0"));
}

function setElementToLoadingState(elementSelector, loadingText, loadingClasses) {
  const targetElement = document.querySelector(elementSelector);
  if (!targetElement) return;
  
  targetElement.textContent = loadingText;
  targetElement.className = targetElement.className.replace(" loading", "") + " " + loadingClasses;
}

export function setText(elementSelector, displayText) {
  const targetElement = document.querySelector(elementSelector);
  if (!targetElement) return;
  
  targetElement.textContent = displayText;
  removeLoadingClasses(targetElement);
}

function removeLoadingClasses(htmlElement) {
  htmlElement.className = htmlElement.className
    .replace(" loading", "")
    .replace(" loading-dots", "");
}
