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
    ".todoTaskAmount", ".doneTaskAmount", ".taskInProgress", 
    ".awaitingFeedback", ".taskInBoard", ".urgentTaskAmount"
  ];

  taskCounterSelectors.forEach(selector => {
    setElementToLoadingState(selector, "...", "loading loading-dots");
  });
}

function displayUrgentDateLoadingState() {
  setElementToLoadingState(".urgentTaskDate", "Loading...", "loading");
}

function setElementToLoadingState(
  elementSelector,
  loadingText,
  loadingClasses
) {
  const targetElement = document.querySelector(elementSelector);
  if (targetElement) {
    targetElement.textContent = loadingText;
    targetElement.className =
      targetElement.className.replace(" loading", "") + " " + loadingClasses;
  }
}

async function updateTaskSummaryWithRetryLogic(maximumRetries = 3, retryDelayMs = 800) {
  displayDataLoadingState();

  for (let attemptNumber = 1; attemptNumber <= maximumRetries; attemptNumber++) {
    const shouldContinueRetrying = await attemptSummaryUpdate(attemptNumber, maximumRetries, retryDelayMs);
    if (!shouldContinueRetrying) return;
  }
  
  displayErrorState();
}

async function attemptSummaryUpdate(attemptNumber, maximumRetries, retryDelayMs) {
  try {
    const isUpdateSuccessful = await updateSummary();
    if (isUpdateSuccessful) return false;
    
    return await handleRetryLogic(attemptNumber, maximumRetries, retryDelayMs);
  } catch (summaryError) {
    return await handleSummaryError(summaryError, attemptNumber, maximumRetries, retryDelayMs);
  }
}

async function handleRetryLogic(attemptNumber, maximumRetries, retryDelayMs) {
  if (attemptNumber < maximumRetries) {
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    return true;
  }
  return false;
}

async function handleSummaryError(summaryError, attemptNumber, maximumRetries, retryDelayMs) {
  if (attemptNumber === maximumRetries) {
    return false;
  }
  
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  return true;
}

function displayErrorState() {
  displayErrorCounters();
  setText(".urgentTaskDate", "No data");
}

function displayErrorCounters() {
  const errorSelectors = [
    ".todoTaskAmount", ".doneTaskAmount", ".taskInProgress",
    ".awaitingFeedback", ".taskInBoard", ".urgentTaskAmount"
  ];

  errorSelectors.forEach(selector => setText(selector, "0"));
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
  processUserGreetingUpdate(currentUserString);
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
    profileButton: document.getElementById("openMenu"),
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

async function updateSummary() {
  try {
    const response = await requestData("GET", "/tasks/");
    if (!response || typeof response !== "object") return false;

    const { data: tasksFromDatabase } = response;
    return handleTasksResponse(tasksFromDatabase, response);
  } catch (error) {
    return false;
  }
}

function handleTasksResponse(tasksFromDatabase, response) {
  if (!tasksFromDatabase) {
    if (response.hasOwnProperty("data")) {
      setTextUpdateSummary([]);
      return true;
    }
    return false;
  }

  const allTasksArray = Object.values(tasksFromDatabase);
  return processTasksDataForSummary(allTasksArray);
}

function processTasksDataForSummary(allTasksArray) {
  if (!validateTaskData(allTasksArray)) {
    // Don't update display if validation fails, keep loading state
    return false;
  }

  setTextUpdateSummary(allTasksArray);
  return true;
}

function validateTaskData(allTasksDataArray) {
  if (!Array.isArray(allTasksDataArray) || allTasksDataArray.length === 0) {
    return Array.isArray(allTasksDataArray);
  }

  const firstTaskSample = allTasksDataArray[0];
  const mandatoryFieldsList = ["title", "status"];

  return mandatoryFieldsList.every(fieldName => 
    firstTaskSample.hasOwnProperty(fieldName)
  );
}

async function setTextUpdateSummary(allTasksDataArray) {
  const urgentPriorityTasksCount = countTasksByPriority(allTasksDataArray, "urgent");
  const earliestUrgentTaskDueDate = getEarliestUrgentDueDate(allTasksDataArray);

  updateTaskCounters(allTasksDataArray);
  updateUrgentTaskDisplay(urgentPriorityTasksCount, earliestUrgentTaskDueDate);
}

function updateTaskCounters(allTasksDataArray) {
  setText(".todoTaskAmount", countTasksByStatus(allTasksDataArray, "todo"));
  setText(".doneTaskAmount", countTasksByStatus(allTasksDataArray, "done"));
  setText(".taskInProgress", countTasksByStatus(allTasksDataArray, "in-progress"));
  setText(".awaitingFeedback", countTasksByStatus(allTasksDataArray, "await"));
  setText(".taskInBoard", allTasksDataArray.length);
}

function updateUrgentTaskDisplay(urgentCount, earliestDate) {
  setText(".urgentTaskAmount", urgentCount);
  const urgentDateText = earliestDate || (urgentCount > 0 ? "No date set" : "No urgent tasks");
  setText(".urgentTaskDate", urgentDateText);
}

function countTasksByStatus(allTasksDataArray, targetStatusLevel) {
  return allTasksDataArray.filter(task => task.status === targetStatusLevel).length;
}

function countTasksByPriority(allTasksDataArray, targetPriorityLevel) {
  const searchedPriorityLevel = targetPriorityLevel.toLowerCase();
  
  return allTasksDataArray.filter(task => {
    const currentTaskPriority = (task.prio || "").toLowerCase();
    return currentTaskPriority === searchedPriorityLevel;
  }).length;
}

function getEarliestUrgentDueDate(allTasksDataArray) {
  const urgentTasksWithDueDates = allTasksDataArray.filter(task => {
    const taskHasUrgentPriority = (task.prio || "").toLowerCase() === "urgent";
    const taskHasDueDate = !!task.dueDate;
    return taskHasUrgentPriority && taskHasDueDate;
  });

  if (urgentTasksWithDueDates.length === 0) return null;
  return formatEarliestDueDate(urgentTasksWithDueDates);
}

function formatEarliestDueDate(urgentTasksList) {
  const dueDateObjects = urgentTasksList.map(task => new Date(task.dueDate));
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
