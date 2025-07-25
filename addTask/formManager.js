/**
 * Add Task Form Management
 * Verwaltung des Add Task Formulars
 */

export let currentlySelectedPriority = "medium";
export let subtaskItemsList = [];

export function getCurrentPriority() {
  return currentlySelectedPriority;
}

export function setCurrentPriority(priority) {
  currentlySelectedPriority = priority;
}

export function getSubtaskItems() {
  return subtaskItemsList;
}

export function setSubtaskItems(items) {
  subtaskItemsList = [...items];
}

export function addSubtaskItem(item) {
  subtaskItemsList.push(item);
}

export function removeSubtaskItem(index) {
  subtaskItemsList.splice(index, 1);
}

export function updateSubtaskItem(index, newValue) {
  subtaskItemsList[index] = newValue;
}

export function resetFormState() {
  currentlySelectedPriority = "medium";
  subtaskItemsList = [];
}

export function collectTaskData(form) {
  const existingTaskId = form.getAttribute("data-task-id");
  const taskData = {
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentlySelectedPriority,
    assignedUsers: collectAssignedUsers(),
    subtasks: [...subtaskItemsList],
    subtaskDone: new Array(subtaskItemsList.length).fill(false),
    status: "todo",
  };
  
  if (existingTaskId) {
    taskData.id = existingTaskId;
  }
  
  return taskData;
}

export function validateTask(task) {
  let isValid = true;
  const show = (id, condition) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.display = condition ? "inline" : "none";
    if (condition) isValid = false;
  };

  show("titleAlert", !task.title);
  show("dateAlert", !task.dueDate);
  show("categoryAlert", !task.category);

  return isValid;
}

function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map((cb) => cb.value);
}

export function clearValidationAlerts() {
  const alertElementIds = ["titleAlert", "dateAlert", "categoryAlert"];
  alertElementIds.forEach(alertId => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) alertElement.style.display = "none";
  });
}
