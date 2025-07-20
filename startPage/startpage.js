import { requestData } from "../scripts/firebase.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  displayDataLoadingState();
  updateUserGreetingDisplay();
  await updateTaskSummaryWithRetryLogic();
  handleMobileGreetingFadeEffect();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
});


function displayDataLoadingState() {
  displayTaskCountersLoadingState();
  displayUrgentDateLoadingState();
}

function displayTaskCountersLoadingState() {
  const taskCounterSelectors = [
    ".todoTaskAmount", 
    ".doneTaskAmount", 
    ".taskInProgress", 
    ".awaitingFeedback", 
    ".taskInBoard", 
    ".urgentTaskAmount"
  ];
  
  for (let selectorIndex = 0; selectorIndex < taskCounterSelectors.length; selectorIndex++) {
    setElementToLoadingState(taskCounterSelectors[selectorIndex], "...", "loading loading-dots");
  }
  const name = user.userName || 'Guest'
  renderGreeting(name)
}

function displayUrgentDateLoadingState() {
  setElementToLoadingState(".urgentTaskDate", "Loading...", "loading");
}

function setElementToLoadingState(elementSelector, loadingText, loadingClasses) {
  const targetElement = document.querySelector(elementSelector);
  if (targetElement) {
    targetElement.textContent = loadingText;
    targetElement.className = targetElement.className.replace(" loading", "") + " " + loadingClasses;
  }
}

async function updateTaskSummaryWithRetryLogic(maximumRetries = 3, retryDelayMs = 1000) {
  for (let attemptNumber = 1; attemptNumber <= maximumRetries; attemptNumber++) {
    const shouldContinueRetrying = await attemptSummaryUpdate(attemptNumber, maximumRetries, retryDelayMs);
    if (!shouldContinueRetrying) {
      return;
    }
  }
}

async function attemptSummaryUpdate(attemptNumber, maximumRetries, retryDelayMs) {
  try {
    const isUpdateSuccessful = await updateSummary();
    
    if (isUpdateSuccessful) {
      return false;
    }
    
    return await handleRetryLogic(attemptNumber, maximumRetries, retryDelayMs);
  } catch (summaryError) {
    return await handleSummaryError(summaryError, attemptNumber, maximumRetries, retryDelayMs);
  }
}

async function handleRetryLogic(attemptNumber, maximumRetries, retryDelayMs) {
  if (attemptNumber < maximumRetries) {
    await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    return true;
  }
  return false;
}

async function handleSummaryError(summaryError, attemptNumber, maximumRetries, retryDelayMs) {
  if (attemptNumber === maximumRetries) {
    displayErrorState();
    return false;
  } else {
    await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    return true;
  }
}

function displayErrorState() {
  displayErrorCounters();
  setText(".urgentTaskDate", "No data");
}

function displayErrorCounters() {
  const errorSelectors = [
    ".todoTaskAmount", 
    ".doneTaskAmount", 
    ".taskInProgress", 
    ".awaitingFeedback", 
    ".taskInBoard", 
    ".urgentTaskAmount"
  ];
  
  for (let selectorIndex = 0; selectorIndex < errorSelectors.length; selectorIndex++) {
    const currentSelector = errorSelectors[selectorIndex];
    setText(currentSelector, "0");
  }
}

window.addEventListener("focus", async () => {
  await updateTaskSummaryWithRetryLogic();
});

window.addEventListener("pageshow", async (pageShowEvent) => {
  if (pageShowEvent.persisted) {
    await updateTaskSummaryWithRetryLogic();
  }
});

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    await updateTaskSummaryWithRetryLogic();
  }
});

function updateUserGreetingDisplay() {
  const currentUserString = localStorage.getItem("currentUser");
  if (!currentUserString) return;

  try {
    processUserGreetingUpdate(currentUserString);
  } catch (greetingError) {
    // Silently handle parsing errors
  }
}

function processUserGreetingUpdate(userDataString) {
  const userData = JSON.parse(userDataString);
  const userName = userData.userName || "Guest";
  const greetingDisplayElements = getGreetingDisplayElements();
  const timeBasedGreetingText = generateTimeBasedGreeting();

  updateAllGreetingElements(greetingDisplayElements, userName, timeBasedGreetingText);
}

function getGreetingDisplayElements() {
  return {
    greetingElement: document.querySelector(".greetings > p:first-child"),
    nameElement: document.querySelector(".greetings .username"),
    profileButton: document.getElementById("openMenu")
  };
}

function generateTimeBasedGreeting() {
  const currentHour = new Date().getHours();
  
  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
}

function updateAllGreetingElements(displayElements, userName, greetingText) {
  if (displayElements.greetingElement) {
    displayElements.greetingElement.textContent = `${greetingText},`;
  }
  if (displayElements.nameElement) {
    displayElements.nameElement.textContent = userName;
  }
  if (displayElements.profileButton) {
    displayElements.profileButton.textContent = getInitials(userName);
  }
}

/**
 * Fetches tasks and renders the summary, catching any errors.
 * @async
 */
async function updateSummary() {
  try {
    const { data: tasksFromDatabase } = await requestData("GET", "/tasks/");
    
    if (!tasksFromDatabase) {
      setTextUpdateSummary([]);
      return false;
    }
    
    const allTasksArray = Object.values(tasksFromDatabase);
    
    return processTasksDataForSummary(allTasksArray);
  } catch (error) {
    setTextUpdateSummary([]);
    return false;
  }
}

function processTasksDataForSummary(allTasksArray) {
  if (!validateTaskData(allTasksArray)) {
    setTextUpdateSummary([]);
    return false;
  }
  
  setTextUpdateSummary(allTasksArray);
  return true;
}

function validateTaskData(allTasksDataArray) {
  if (!Array.isArray(allTasksDataArray)) {
    return false;
  }

  if (allTasksDataArray.length === 0) {
    return true;
  }
  
  const firstTaskSample = allTasksDataArray[0];
  const mandatoryFieldsList = ['title', 'status'];
  
  for (let fieldIndex = 0; fieldIndex < mandatoryFieldsList.length; fieldIndex++) {
    const requiredFieldName = mandatoryFieldsList[fieldIndex];
    if (!firstTaskSample.hasOwnProperty(requiredFieldName)) {
      return false;
    }
  }
  return true;
}

async function setTextUpdateSummary(allTasksDataArray) {
  const urgentPriorityTasksCount = countTasksByPriority(allTasksDataArray, "urgent");
  const earliestUrgentTaskDueDate = getEarliestUrgentDueDate(allTasksDataArray);
    
  setText(".todoTaskAmount", countTasksByStatus(allTasksDataArray, "todo"));
  setText(".doneTaskAmount", countTasksByStatus(allTasksDataArray, "done"));
  setText(".taskInProgress", countTasksByStatus(allTasksDataArray, "in-progress"));
  setText(".awaitingFeedback", countTasksByStatus(allTasksDataArray, "await"));
  setText(".taskInBoard", allTasksDataArray.length);
  setText(".urgentTaskAmount", urgentPriorityTasksCount);
  setText(".urgentTaskDate", earliestUrgentTaskDueDate || "No deadline");
}

function countTasksByStatus(allTasksDataArray, targetStatusLevel) {
  let matchingStatusTasksCount = 0;
  
  for (let taskIndex = 0; taskIndex < allTasksDataArray.length; taskIndex++) {
    const currentTaskData = allTasksDataArray[taskIndex];
    if (currentTaskData.status === targetStatusLevel) {
      matchingStatusTasksCount++;
    }
  }
  
  return matchingStatusTasksCount;
}

function countTasksByPriority(allTasksDataArray, targetPriorityLevel) {
  let matchingPriorityTasksCount = 0;
  
  for (let taskIndex = 0; taskIndex < allTasksDataArray.length; taskIndex++) {
    const currentTaskData = allTasksDataArray[taskIndex];
    const currentTaskPriority = (currentTaskData.prio || "").toLowerCase();
    const searchedPriorityLevel = targetPriorityLevel.toLowerCase();
    
    if (currentTaskPriority === searchedPriorityLevel) {
      matchingPriorityTasksCount++;
    }
  }
  
  return matchingPriorityTasksCount;
}

function getEarliestUrgentDueDate(allTasksDataArray) {
  const urgentTasksWithDueDates = [];
  
  for (let taskIndex = 0; taskIndex < allTasksDataArray.length; taskIndex++) {
    const currentTaskData = allTasksDataArray[taskIndex];
    const taskHasUrgentPriority = (currentTaskData.prio || "").toLowerCase() === "urgent";
    const taskHasDueDate = !!currentTaskData.dueDate;
    
    if (taskHasUrgentPriority && taskHasDueDate) {
      urgentTasksWithDueDates.push(currentTaskData);
    }
  }

  if (urgentTasksWithDueDates.length === 0) return null;
  
  return formatEarliestDueDate(urgentTasksWithDueDates);
}

function formatEarliestDueDate(urgentTasksList) {
  const dueDateObjects = [];
  for (let taskIndex = 0; taskIndex < urgentTasksList.length; taskIndex++) {
    const taskData = urgentTasksList[taskIndex];
    dueDateObjects.push(new Date(taskData.dueDate));
  }
  
  dueDateObjects.sort((firstDate, secondDate) => firstDate - secondDate);
  
  const dateFormattingOptions = { year: "numeric", month: "long", day: "numeric" };
  return dueDateObjects[0].toLocaleDateString("en-US", dateFormattingOptions);
}

function setText(elementSelector, displayText) {
  const targetElement = document.querySelector(elementSelector);
  if (targetElement) {
    targetElement.textContent = displayText;
    removeLoadingClasses(targetElement);
  }
}

function removeLoadingClasses(htmlElement) {
  htmlElement.className = htmlElement.className
    .replace(" loading", "")
    .replace(" loading-dots", "");
}

function handleMobileGreetingFadeEffect() {
  if (window.innerWidth < 767) {
    const greetingsElement = document.querySelector(".greetings");
    if (greetingsElement) {
      setTimeout(() => greetingsElement.classList.add("hidden"), 500);
    }
  }
}

window.fetchTasks      = fetchTasks
window.updateSummary   = updateSummary
initStartPage()

