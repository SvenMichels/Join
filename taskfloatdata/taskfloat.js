/**
 * Task Modal Main Controller
 * Hauptsteuerung für das Task Modal
 */
import { requestData } from "../scripts/firebase.js";
import { getInitials } from "../scripts/utils/helpers.js";
import {
  selectPriorityModal,
  getCurrentPriority,
  initPriorityEventListeners
} from "./priorityManager.js";
import {
  loadAndRenderUsersModal,
  toggleUserListModal,
  initUserSearchEventListener,
  clearSelectedUserNamesModal
} from "./userAssignmentManager.js";
import {
  addSubtaskModal,
  addSubtaskOnEnterModal,
  renderSubtasksModal,
  resetSubtasks,
  setSubtaskItems,
  setCompletedSubtasks,
  getSubtaskItems,
  getCompletedSubtasks,
  updateSubtasks
} from "./subtaskManager.js";
import { setupOutsideClickHandler, removeNoScroll } from "../board/taskDetails.js";
import { initInputField } from "../scripts/auth/Validation.js";
import { initCategoryDropdown } from "../addTask/formManager.js";

const $ = {};

/**
 * Initialisiert das Task-Modal
 * @returns {Promise} Promise für die Initialisierung
 */
export function initTaskFloat() {
  cacheDom();
  if (!$.modal) {
    return Promise.resolve();
  }

  loadUserInitialsModal();
  initUserSearchEventListener();
  initPriorityEventListeners();
  initInputField("task-title-modal", 'titelModalHint', 'name');
  initInputField("task-description-modal", 'descriptionModalHint', 'name');
  initInputField("subtask-modal", 'subtaskModalHint', 'subtask');
  initInputField("task-date-modal", 'task-date-modal-Hint', 'date');
  initCategoryDropdown(".prio-category-container", "#category-modal", "#categoryOptions-modal", "task-title-modal", "task-date-modal");

  return initFormModal();
}

/**
 * Cached DOM-Elemente für bessere Performance
 */
function cacheDom() {
  $.modal = document.querySelector(".form-wrapper-modal");
  if (!$.modal) return;

  $.closeBtn = $.modal?.querySelector(".close-button-modal");
  $.clearBtn = document.getElementById("clearBtn-modal");
  $.form = document.getElementById("taskForm-modal");
  $.date = document.getElementById("task-date-modal");
  $.subInput = document.getElementById("subtask-modal");
  $.subAddBtn = $.modal?.querySelector(".subtask-add-button-modal");
  $.assignBtn = $.modal?.querySelector(".assigned-userlist-button-modal");

  if ($.date) {
    $.date.min = new Date().toISOString().split("T")[0];
  }

  attachEventListeners();
}

/**
 * Binds event listeners to DOM elements
 */
function attachEventListeners() {
  bindCloseButton();
  bindFormSubmit();
  bindSubtaskAdd();
  bindSubtaskEnter();
  bindAssignToggle();
  bindClearButton();
}

function bindCloseButton() {
  $.closeBtn?.addEventListener("click", closeModal);
}

function bindFormSubmit() {
  $.form?.addEventListener("submit", handleSubmitModal);
}

function bindSubtaskAdd() {
  $.subAddBtn?.addEventListener("click", addSubtaskModal);
}

function bindSubtaskEnter() {
  $.subInput?.addEventListener("keydown", addSubtaskOnEnterModal);
}

function bindAssignToggle() {
  $.assignBtn?.addEventListener("click", toggleUserListModal);
}

function bindClearButton() {
  $.clearBtn?.addEventListener("click", clearSelectedUserNamesModal);
}


/**
 * Initialisiert das Modal-Formular
 * @returns {Promise} Promise für die Initialisierung
 */
export async function initFormModal() {
  initializeSubtasks();
  clearSelectedUserNamesModal();
  await initializeUsers();
  initializePriority();
  initializeCategoryValidation();
}

/**
 * Initialisiert Subtasks
 */
function initializeSubtasks() {
  resetSubtasks();
  renderSubtasksModal();
}

/**
 * Initialisiert das User-System
 * @returns {Promise} Promise für das Laden der User
 */
async function initializeUsers() {
  await loadAndRenderUsersModal();
}

/**
 * Initialisiert die Standard-Priorität
 */
function initializePriority() {
  selectPriorityModal("medium");
}

/**
 * Initialisiert die Kategorie-Validierung
 */
function initializeCategoryValidation() {
  const category = document.getElementById("category-modal");
  const submit = $.form?.querySelector(".create-button");    

  if (!category || !submit) return;
  const updateSubmitState = () => {    
    const value = category.value ?? "";
    submit.disabled = value.trim() === "";
  };  
  updateSubmitState();
  category.addEventListener("change", updateSubmitState);
}

/**
 * Behandelt das Absenden des Modal-Formulars
 * @param {Event} event - Submit-Event
 */
async function handleSubmitModal(event) {
  event.preventDefault();
  const task = collectTaskDataModal(event.target);
  if (!validateTaskModal(task)) return;
  await saveTaskModal(task);
  resetFormState(task);
}

/**
 * Sammelt Task-Daten aus dem Modal-Formular
 * @param {HTMLFormElement} form - Das Formular-Element
 * @returns {Object} Task-Objekt mit allen gesammelten Daten
 */
function collectTaskDataModal(form) {
  const id = form.dataset.taskId || crypto.randomUUID();
  const status = form.dataset.taskStatus || "todo";
  const assignedUsers = Array.from(
    document.querySelectorAll(".user-checkbox-modal:checked")
  ).map(checkbox => checkbox.value);

  return {
    id,
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: getCurrentPriority(),
    assignedUsers,
    subtasks: [...getSubtaskItems()],
    subtaskDone: [...getCompletedSubtasks()],
    status,
  };
}

/**
 * Validiert Task-Daten
 * @param {Object} task - Task-Objekt zum Validieren
 * @returns {boolean} True wenn valid, false wenn invalid
 */
function validateTaskModal(task) {
  const isValidTitle = validateField("titleAlert-modal", task.title);
  const isValidDate = validateField("dateAlert-modal", task.dueDate);
  const isValidCategory = validateField("categoryAlert-modal", task.category);

  return isValidTitle && isValidDate && isValidCategory;
}

/**
 * Validiert ein einzelnes Feld
 * @param {string} alertId - ID des Alert-Elements
 * @param {*} value - Zu validierender Wert
 * @returns {boolean} True wenn valid, false wenn invalid
 */
function validateField(alertId, value) {
  const isValid = !!value;
  const alertElement = document.getElementById(alertId);

  if (alertElement) {
    alertElement.style.display = isValid ? "none" : "inline";
  }

  return isValid;
}

/**
 * Speichert einen Task über die API
 * @param {Object} task - Task-Objekt zum Speichern
 * @returns {Promise} Promise für die API-Anfrage
 */
const saveTaskModal = (task) => requestData("PUT", `/tasks/${task.id}`, task);

/**
 * Setzt den Formular-Zustand nach dem Speichern zurück
 * @param {Object} task - Gespeicherter Task
 */
function resetFormState(task) {
  clearFormAttributes();
  dispatchTaskEvent(task);
  resetModalState();
  attachEventListeners();
  closeModal();
  removeNoScroll();
}

/**
 * Entfernt Formular-Attribute
 */
function clearFormAttributes() {
  if ($.form) {
    $.form.removeAttribute("data-task-id");
    $.form.removeAttribute("data-task-status");
  }
}

/**
 * Sendet Task-Event
 * @param {Object} task - Task-Objekt für Event
 */
function dispatchTaskEvent(task) {
  const eventType = window.isEditMode ? "taskUpdated" : "taskCreated";
  window.dispatchEvent(new CustomEvent(eventType, { detail: task }));
}

/**
 * Setzt den Modal-Zustand zurück
 */
function resetModalState() {
  window.editingTaskId = null;
  window.isEditMode = false;
  resetSubtasks();
  window.pendingAssignedUsers = null;
  if ($.form) {
    $.form.reset();
  }
  clearSelectedUserNamesModal();
  selectPriorityModal("medium");
}

/**
 * Befüllt das Modal mit Task-Daten für die Bearbeitung
 * @param {Object} task - Task-Objekt zum Befüllen
 */
async function prefillModalWithTaskData(task) {
  fillBasicFields(task);
  updateSubtasks(task.subtasks, task.subtaskDone);
  renderSubtasksModal();

  const assigned = Array.isArray(task?.assignedUsers) ? task.assignedUsers
    : Array.isArray(task?.assignedTo) ? task.assignedTo
      : [];
  clearSelectedUserNamesModal();
  await loadAndRenderUsersModal(assigned);
}

/**
 * Befüllt die Basis-Formularfelder
 * @param {Object} task - Task-Objekt mit Daten
 */
function fillBasicFields(task) {
  document.getElementById("task-title-modal").value = task.title || "";
  document.getElementById("task-description-modal").value = task.description || "";
  document.getElementById("task-date-modal").value = task.dueDate || "";
  document.getElementById("category-modal").value = task.category || "";
  selectPriorityModal((task.prio || "medium").toLowerCase());
}

/**
 * Lädt und zeigt Benutzer-Initialen im Modal
 */
function loadUserInitialsModal() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const btn = $.modal?.querySelector(".profile-button-modal");
  const userName = user.userFullName;
  if (btn && userName) btn.textContent = getInitials(userName);
}

/**
 * Schließt das Modal und räumt auf
 */
export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.add("d_none");
    removeNoScroll();
    resetModalFormState();
  }
}

/**
 * Setzt das Modal-Formular komplett zurück (für externe Nutzung)
 */
function resetModalFormState() {
  if (!$.form) {
    cacheDom();
  }

  clearFormAttributes();
  resetModalState();
  setSubtaskItems([]);
  setCompletedSubtasks([]);
  clearSelectedUserNamesModal();
  cacheDom();
  setupOutsideClickHandler($.modal, document.getElementById("modal-overlay"));
}

document.addEventListener("DOMContentLoaded", initTaskFloat);

window.initTaskFloat = initTaskFloat;
window.prefillModalWithTaskData = prefillModalWithTaskData;
window.resetModalFormState = resetModalFormState;