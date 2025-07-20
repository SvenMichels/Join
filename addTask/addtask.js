/**
 * @fileoverview Add Task page functionality for creating and managing tasks
 */

import { requestData } from "../scripts/firebase.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { ensureUserHasAssignedColor } from "../scripts/utils/colors.js";
import { getUserCheckboxTemplate, getSubtaskControlGroupTemplate } from "./addtasktemplates.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { PRIORITY_ICONS } from "../taskFloatData/taskfloat.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";

let currentlySelectedPriority = "medium";
let allSystemUsers = [];
let subtaskItemsList = [];

/**
 * Initializes add task page when DOM content is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeDomElements();
  initializeFormConfiguration();
  loadUserInitialsDisplay();
  setupSearchEventHandlers();
  setupDropdown("#openMenu", "#dropDownMenu");
  highlightActiveNavigationLinks();
  setupMobileDeviceListeners();
});

const domElementCache = {};

/**
 * Caches DOM elements and sets up initial page configuration
 */
function initializeDomElements() {
  assignDomElementsToCache();
  configureDateRestrictions();
  attachAllEventListeners();
}

// Assigns frequently used DOM elements to cache for easier access
function assignDomElementsToCache() {
  domElementCache.openMenuBtn = document.getElementById("openMenu");
  domElementCache.taskForm = document.getElementById("taskForm");
  domElementCache.taskDateInput = document.getElementById("taskDate");
  domElementCache.subtaskInputField = document.getElementById("subtask");
  domElementCache.subtaskAddButton = document.querySelector(".subtask-add-button");
  domElementCache.assignUserListButton = document.querySelector(".assignUserListBtn");
  domElementCache.assignedButtonImage = document.getElementById("assignedBtnImg");
}

// Sets minimum date restriction for task date input to today
function configureDateRestrictions() {
  const currentDate = new Date().toISOString().split("T")[0];
  const taskDateInput = document.getElementById("task-date");
  if (taskDateInput) taskDateInput.min = currentDate;
}

// Attaches event listeners to form elements
function attachAllEventListeners() {
  domElementCache.taskForm?.addEventListener("submit", handleFormSubmission);
  domElementCache.subtaskAddButton?.addEventListener("click", addNewSubtask);
  domElementCache.subtaskInputField?.addEventListener("keydown", addSubtaskOnEnterKey);
  domElementCache.assignUserListButton?.addEventListener("click", toggleUserAssignmentList);

  const clearFormButton = document.getElementById("clearBtn");
  clearFormButton?.addEventListener("click", clearAllFormData);
}

// Toggles the visibility of the user assignment list
function toggleUserAssignmentList(clickEvent) {
  clickEvent.preventDefault();
  const userAssignmentList = document.getElementById("assignedUserList");
  const arrowIndicator = domElementCache.assignedButtonImage;
  const isListVisible = userAssignmentList.classList.toggle("visible");
  arrowIndicator?.classList.toggle("rotated", isListVisible);
}

function resetAllPriorityStyles(prioritySelectionObject) {
  const priorityEntries = Object.entries(prioritySelectionObject);
  
  for (let priorityIndex = 0; priorityIndex < priorityEntries.length; priorityIndex++) {
    const [priorityKey, priorityElementId] = priorityEntries[priorityIndex];
    const priorityElement = document.getElementById(priorityElementId);
    
    priorityElement?.classList.remove(
      "prioUrgentBtnActive",
      "prioMediumBtnActive", 
      "prioLowBtnActive"
    );
    
    const priorityImageElement = document.getElementById(`${priorityKey}-task-img`);
    if (priorityImageElement) priorityImageElement.src = PRIORITY_ICONS[priorityKey][0];
  }
}

function applySelectedPriorityStyle(selectedPriority, prioritySelectionObject) {
  const activePriorityButton = document.getElementById(prioritySelectionObject[selectedPriority]);
  const activePriorityImage = document.getElementById(`${selectedPriority}-task-img`);

  if (selectedPriority === "urgent") {
    activePriorityButton?.classList.add("prioUrgentBtnActive");
  } else if (selectedPriority === "medium") {
    activePriorityButton?.classList.add("prioMediumBtnActive");
  } else if (selectedPriority === "low") {
    activePriorityButton?.classList.add("prioLowBtnActive");
  }

  if (activePriorityImage) {
    activePriorityImage.src = PRIORITY_ICONS[selectedPriority][1];
  }
}

function selectPriority(priority) {
  currentlySelectedPriority = priority;
  const selectPrio = {
    urgent: "urgent-task",
    medium: "medium-task",
    low: "low-task",
  };

  resetAllPriorityStyles(selectPrio);
  applySelectedPriorityStyle(priority, selectPrio);
}

function initializeFormConfiguration() {
  loadAndRenderUsers();
  selectPriority("medium");

  const categorySelect = document.getElementById("category");
  const submitButton = document.querySelector(".create-button");
  submitButton.disabled = true;
  categorySelect.addEventListener("change", () => {
    submitButton.disabled = categorySelect.value.trim() === "";
  });

  ["urgent", "medium", "low"].forEach((prio) => {
    document
      .getElementById(`${prio}-task`)
      ?.addEventListener("click", () => selectPriority(prio));
  });
}

async function handleFormSubmission(event) {
  event.preventDefault();

  const taskData = collectTaskData(event.target);
  if (!isTaskValid(taskData)) return;

  try {
    const result = await saveTask(taskData);
    
    setTimeout(() => {
      showUserFeedback();
      clearAllFormData();
    }, 100);
    
  } catch (saveError) {
    alert("Fehler beim Speichern des Tasks. Bitte versuchen Sie es erneut.");
  }
}

function collectTaskData(form) {
  const existingTaskId = form.getAttribute("data-task-id");
  const taskData = {
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentlySelectedPriority,
    assigned: collectAssignedUsers(),
    subtasks: [...subtaskItemsList],
    subtaskDone: new Array(subtaskItemsList.length).fill(false),
    status: "todo",
  };
  
  // Nur bei bestehenden Tasks die ID setzen
  if (existingTaskId) {
    taskData.id = existingTaskId;
  }
  
  return taskData;
}

function isTaskValid(task) {
  let validTask = true;
  const show = (id, condition) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.display = condition ? "inline" : "none";
    if (condition) validTask = false;
  };

  show("titleAlert", !task.title);
  show("dateAlert", !task.dueDate);
  show("categoryAlert", !task.category);

  return validTask;
}

async function saveTask(taskData) {
  try {
    const isNewTask = !taskData.id;
    const httpMethod = isNewTask ? "POST" : "PUT";
    const apiEndpoint = isNewTask ? "/tasks" : `/tasks/${taskData.id}`;
    
    const response = await requestData(httpMethod, apiEndpoint, taskData);
    return response;
  } catch (saveError) {
    throw saveError;
  }
}

async function loadAndRenderUsers() {
  const { data = {} } = await requestData("GET", "/users");
  const userEntries = Object.entries(data);
  
  allSystemUsers = [];
  for (let entryIndex = 0; entryIndex < userEntries.length; entryIndex++) {
    const [userId, userInformation] = userEntries[entryIndex];
    allSystemUsers.push({ id: userId, ...userInformation });
  }

  // Remove duplicate users by username
  const uniqueSystemUsers = [];
  for (let userIndex = 0; userIndex < allSystemUsers.length; userIndex++) {
    const currentUser = allSystemUsers[userIndex];
    const isDuplicate = uniqueSystemUsers.some(existingUser => 
      existingUser.userName === currentUser.userName
    );
    if (!isDuplicate) {
      uniqueSystemUsers.push(currentUser);
    }
  }
  
  allSystemUsers = uniqueSystemUsers;
  renderUserCheckboxes(allSystemUsers);
}

function clearAndPrepareContainer(id) {
  const container = document.getElementById(id);
  if (!container) return null;
  container.innerHTML = "";
  return container;
}

function addUniqueCheckboxes(users, preSelected, container) {
  const uniqueNames = new Set();

  users.forEach(async (user) => {
    user = await ensureUserHasAssignedColor(user);
    if (uniqueNames.has(user.userName)) return;
    uniqueNames.add(user.userName);

    const isChecked = preSelected.includes(user.userName);
    const checkboxElement = createUserCheckboxElement(user, isChecked);
    container.appendChild(checkboxElement);
  });
}

async function renderUserCheckboxes(users, preselected = []) {
  const container = clearAndPrepareContainer("assignedUserList");
  if (!container) return;

  addUniqueCheckboxes(users, preselected, container);
  updateSelectedUserDisplay();
}

function createUserCheckboxElement(user, isChecked) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper";
  if (isChecked) wrapper.classList.add("active");

  wrapper.innerHTML = getUserCheckboxTemplate(user, isChecked);
  attachCheckboxListener(wrapper);
  return wrapper;
}

function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");

  wrapper.addEventListener("click", (e) => {
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
    wrapper.classList.toggle("active", checkbox.checked);
    updateSelectedUserDisplay();
  });
}

function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map((cb) => cb.value);
}

function updateSelectedUserDisplay() {
  const selectedContainer = document.getElementById("selectedUser");
  selectedContainer.innerHTML = "";
  collectAssignedUsers().forEach((name) => {
    const user = allSystemUsers.find((u) => u.userName === name);
    const chip = document.createElement("div");
    chip.className = `selected-contact-chip ${user?.colorClass || "color-1"}`;
    chip.textContent = getInitials(name);
    selectedContainer.appendChild(chip);
  });
}

function addNewSubtask(element) {
  element.preventDefault();
  const subtaskInputValue = domElementCache.subtaskInputField.value.trim();
  if (!subtaskInputValue) return;
  subtaskItemsList.push(subtaskInputValue);
  domElementCache.subtaskInputField.value = "";
  renderSubtasks();
}

function addSubtaskOnEnterKey(element) {
  if (element.key === "Enter") {
    element.preventDefault();
    addSubtask(element);
  }
}

function renderSubtasks() {
  const list = document.getElementById("subtaskList");
  list.innerHTML = "";

  for (let index = 0; index < subtaskItemsList.length; index++) {
    const text = subtaskItemsList[index];
    const container = createSubtaskContainer(text, index);
    list.appendChild(container);
  }
}

function createSubtaskContainer(text, index) {
  const container = document.createElement("div");
  container.className = "subtask-container";

  const textElement = createTextElement(text, index);
  const controlGroup = createControlGroup(index);

  container.append(textElement, controlGroup);
  return container;
}

function createTextElement(text, index) {
  const span = document.createElement("span");
  span.className = "subtask-display-text";
  span.textContent = text;
  span.addEventListener("click", () => makeSubtaskEditable(index));
  return span;
}

function createControlGroup(index) {
  const wrapper = document.createElement("div");
  wrapper.className = "subtask-controls";
  wrapper.innerHTML = getSubtaskControlGroupTemplate();

  const [editBtn, , deleteBtn] = wrapper.children;
  addControlListeners(editBtn, deleteBtn, index);

  return wrapper;
}

function addControlListeners(editBtn, deleteBtn, index) {
  editBtn.addEventListener("click", (e) => {
    e.preventDefault();
    makeSubtaskEditable(index);
  });
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    subtaskItemsList.splice(index, 1);
    renderSubtasks();
  });
}

function makeSubtaskEditable(index) {
  const list = document.getElementById("subtaskList");
  const container = list.children[index];
  container.innerHTML = "";

  const input = createSubtaskInput(subtaskItemsList[index]);
  const buttonGroup = createSubtaskButtons(index, input);

  container.append(input, buttonGroup);
}

function createSubtaskInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.className = "subtask-text-input";
  return input;
}

function createSubtaskButtons(index, input) {
  const wrapper = createElement("div", "subtask-button-wrapper");
  const spacer = createElement("div", "subtask-spacer");

  const saveBtn = createIconButton("check.svg", "subtask-save-button", () => {
    subtaskItemsList[index] = input.value.trim();
    renderSubtasks();
  });

  const deleteBtn = createIconButton(
    "delete.svg",
    "subtask-delete-button",
    () => {
      subtaskItemsList.splice(index, 1);
      renderSubtasks();
    }
  );

  wrapper.append(deleteBtn, spacer, saveBtn);
  return wrapper;
}

function createElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

function createIconButton(icon, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.innerHTML = `<img src="../assets/icons/${icon}" alt="${className}">`;
  btn.addEventListener("click", onClick);
  return btn;
}

function loadUserInitialsDisplay() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const { userName = "Guest" } = JSON.parse(userString);
  document.getElementById("openMenu").textContent = getInitials(userName);
}

function setupSearchEventHandlers() {
  const searchBar = document.getElementById("searchUser");
  searchBar.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    if (term.length < 3) {
      if (!term.length) renderUserCheckboxes(allSystemUsers);
      return;
    }
    document.getElementById("assignedUserList").classList.add("visible");
    renderUserCheckboxes(
      allSystemUsers.filter((u) => u.userName.toLowerCase().includes(term))
    );
  });
}

function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("d_none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("d_none");
      feedback.classList.remove("centerFeedback");
    }, 1500);
  });
}

function clearAllFormData() {
  resetFormAndStates();
  clearValidationAlerts();
  clearSelectedUsers();
  setupMobileDeviceListeners();
}

function resetFormAndStates() {
  domElementCache.taskForm?.reset();
  currentlySelectedPriority = "medium";
  subtaskItemsList = [];
  selectPriority("medium");
  renderSubtasks();
}

function clearValidationAlerts() {
  const alertElementIds = ["titleAlert", "dateAlert", "categoryAlert"];
  for (let alertIndex = 0; alertIndex < alertElementIds.length; alertIndex++) {
    const alertElementId = alertElementIds[alertIndex];
    const alertElement = document.getElementById(alertElementId);
    if (alertElement) alertElement.style.display = "none";
  }
}

function clearSelectedUsers() {
  const selectedUserContainer = document.getElementById("selectedUser");
  if (selectedUserContainer) {
    selectedUserContainer.innerHTML = "";
  }
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.closest('.user-checkbox-wrapper')?.classList.remove('active');
  });
}
