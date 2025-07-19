// Convert values to arrays
export function toArray(inputValue) {
  if (Array.isArray(inputValue)) return inputValue;
  if (inputValue && typeof inputValue === "object") return Object.values(inputValue);
  if (typeof inputValue === "string") {
    const stringParts = inputValue.split(",");
    const trimmedParts = [];
    for (let partIndex = 0; partIndex < stringParts.length; partIndex++) {
      trimmedParts.push(stringParts[partIndex].trim());
    }
    return trimmedParts;
  }
  return [];
}

// Validate task object
export function validateTask(taskData) {
  if (!taskData || typeof taskData !== 'object') return false;
  
  const requiredFieldsList = ['title', 'status'];
  for (let fieldIndex = 0; fieldIndex < requiredFieldsList.length; fieldIndex++) {
    const requiredField = requiredFieldsList[fieldIndex];
    if (!taskData.hasOwnProperty(requiredField) || !taskData[requiredField]) {
      return false;
    }
  }
  return true;
}

// Validate task data array
export function validateTaskData(tasksArray) {
  if (!Array.isArray(tasksArray)) {
    console.warn("Tasks is not an array");
    return false;
  }
  
  if (tasksArray.length === 0) {
    return true;
  }
  
  const sampleTaskData = tasksArray[0];
  const requiredFieldsList = ['title', 'status'];
  
  for (let fieldIndex = 0; fieldIndex < requiredFieldsList.length; fieldIndex++) {
    const requiredField = requiredFieldsList[fieldIndex];
    if (!sampleTaskData.hasOwnProperty(requiredField)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Counts tasks by their status
 * @param {Array} tasksArray - Array of task objects
 * @param {string} statusToCount - Status to count
 * @returns {number} Number of tasks with specified status
 */
export function countByStatus(tasksArray, statusToCount) {
  let taskCountWithStatus = 0;
  for (let taskIndex = 0; taskIndex < tasksArray.length; taskIndex++) {
    const currentTask = tasksArray[taskIndex];
    if (currentTask.status === statusToCount) {
      taskCountWithStatus++;
    }
  }
  return taskCountWithStatus;
}

/**
 * Counts tasks by their priority level
 * @param {Array} tasksArray - Array of task objects
 * @param {string} priorityToCount - Priority level to count
 * @returns {number} Number of tasks with specified priority
 */
export function countByPriority(tasksArray, priorityToCount) {
  let taskCountWithPriority = 0;
  for (let taskIndex = 0; taskIndex < tasksArray.length; taskIndex++) {
    const currentTask = tasksArray[taskIndex];
    const taskPriorityLevel = (currentTask.prio || "").toLowerCase();
    const targetPriorityLevel = priorityToCount.toLowerCase();
    if (taskPriorityLevel === targetPriorityLevel) {
      taskCountWithPriority++;
    }
  }
  return taskCountWithPriority;
}

/**
 * Finds the earliest due date among urgent priority tasks
 * @param {Array} tasksArray - Array of task objects
 * @returns {string|null} Formatted earliest due date or null if none found
 */
export function getEarliestUrgentDueDate(tasksArray) {
  const urgentTasksWithDueDates = [];
  
  for (let taskIndex = 0; taskIndex < tasksArray.length; taskIndex++) {
    const currentTask = tasksArray[taskIndex];
    const isUrgentPriority = (currentTask.prio || "").toLowerCase() === "urgent";
    const hasDueDateSet = !!currentTask.dueDate;
    
    if (isUrgentPriority && hasDueDateSet) {
      urgentTasksWithDueDates.push(currentTask);
    }
  }

  if (urgentTasksWithDueDates.length === 0) return null;

  const dueDateTimestamps = [];
  for (let urgentTaskIndex = 0; urgentTaskIndex < urgentTasksWithDueDates.length; urgentTaskIndex++) {
    const urgentTask = urgentTasksWithDueDates[urgentTaskIndex];
    dueDateTimestamps.push(new Date(urgentTask.dueDate));
  }
  
  dueDateTimestamps.sort((dateA, dateB) => dateA - dateB);

  const dateFormattingOptions = { year: "numeric", month: "long", day: "numeric" };
  return dueDateTimestamps[0].toLocaleDateString("en-US", dateFormattingOptions);
}

/**
 * Generates a unique task ID using timestamp and random string
 * @returns {string} Unique task identifier
 */
export function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
