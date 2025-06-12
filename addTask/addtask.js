import { requestData } from "../scripts/firebase.js";

const priorityIcons = {
  urgent: ["../assets/icons/urgent_red.svg", "../assets/icons/urgent_white.svg"],
  medium: ["../assets/icons/medium_yellow.svg", "../assets/icons/medium_white.svg"],
  low: ["../assets/icons/low_green.svg", "../assets/icons/low_white.svg"]
};

let currentActivePriority = null;

window.addEventListener("DOMContentLoaded", () => {
  initializeForm();
  initializePriorityButtons();
});

function initializeForm() {
  const form = document.getElementById("taskForm");
  form.addEventListener("submit", handleFormSubmit);
}

function initializePriorityButtons() {
  ["urgent", "medium", "low"].forEach(priority => {
    const button = document.getElementById(`${priority}-task`);
    button.addEventListener("click", event => handlePrioritySelection(event, priority));
  });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const task = collectTaskData(form);

  if (!isTaskValid(task)) {
    alert("Bitte alle Pflichtfelder ausfüllen!");
    return;
  }

  submitTask(task);
  resetFormState(form);
}

function collectTaskData(form) {
  return {
    id: Date.now(),
    title: getValue(form, "taskTitle"),
    description: getValue(form, "taskDescription"),
    dueDate: form.elements["taskDate"].value,
    category: form.elements["category"].value,
    assigned: form.elements["assignedUsers"].value,
    subtasks: parseSubtasks(form.elements["subtask"].value),
    prio: getSelectedPriority(),
    status: "todo"
  };
}

function getValue(form, name) {
  return form.elements[name].value.trim();
}

function parseSubtasks(subtasks) {
  return subtasks
    .split(",")
    .map(subtask => subtask.trim())
    .filter(Boolean);
}

function getSelectedPriority() {
  if (isPrioritySelected("urgent")) return "Urgent";
  if (isPrioritySelected("medium")) return "Medium";
  if (isPrioritySelected("low")) return "Low";
  return null;
}

function isPrioritySelected(priority) {
  const button = document.getElementById(`${priority}-task`);
  return button.classList.contains(getPriorityClass(priority));
}

function isTaskValid(task) {
  return task.title && task.description && task.category;
}

async function submitTask(task) {
  console.log("Neue Aufgabe:", task);
  await requestData("POST", "/tasks/", task);
}

function resetFormState(form) {
  form.reset();
  resetPrioritySelection();
  alert("Aufgabe erfolgreich erstellt!");
}

function handlePrioritySelection(event, priority) {
  event.preventDefault();
  resetPrioritySelection();
  activatePriority(priority);
  updatePriorityIcon(priority);
}

function activatePriority(priority) {
  const button = document.getElementById(`${priority}-task`);
  button.classList.add(getPriorityClass(priority));
}

function updatePriorityIcon(priority) {
  const icon = getPriorityIcon(priority);
  if (!icon) return;

  const [inactive, active] = priorityIcons[priority];
  const isActive = currentActivePriority === priority;

  icon.src = isActive ? inactive : active;
  currentActivePriority = isActive ? null : priority;
}

function resetPrioritySelection() {
  ["urgent", "medium", "low"].forEach(priority => {
    deactivatePriority(priority);
    resetPriorityIcon(priority);
  });
  currentActivePriority = null;
}

function deactivatePriority(priority) {
  const button = document.getElementById(`${priority}-task`);
  button.classList.remove(getPriorityClass(priority));
}

function resetPriorityIcon(priority) {
  const icon = getPriorityIcon(priority);
  if (icon) icon.src = priorityIcons[priority][0];
}

function getPriorityClass(priority) {
  return `prio${capitalize(priority)}BtnActive`;
}

function getPriorityIcon(priority) {
  return document.getElementById(`${priority}-task-img`) || document.getElementById(`${priority}-task`);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
