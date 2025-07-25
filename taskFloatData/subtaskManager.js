/**
 * Subtask Management for Task Modal
 * Verwaltung der Subtasks
 */

import { getSubtaskHTML, getEditableSubtaskTemplate } from "./taskfloatHTML.js";

let subtaskItemsListModal = [];
let completedSubtasksModal = [];

/**
 * Gibt die Subtask-Items zurück
 * @returns {Array} Array der Subtask-Items
 */
export function getSubtaskItems() {
  return subtaskItemsListModal;
}

/**
 * Gibt die abgeschlossenen Subtasks zurück
 * @returns {Array} Array der abgeschlossenen Subtasks
 */
export function getCompletedSubtasks() {
  return completedSubtasksModal;
}

/**
 * Setzt die Subtask-Items
 * @param {Array} items - Array der Subtask-Items
 */
export function setSubtaskItems(items) {
  subtaskItemsListModal = [...items];
}

/**
 * Setzt die abgeschlossenen Subtasks
 * @param {Array} completed - Array der abgeschlossenen Subtasks
 */
export function setCompletedSubtasks(completed) {
  completedSubtasksModal = [...completed];
}

/**
 * Setzt alle Subtasks zurück
 */
export function resetSubtasks() {
  subtaskItemsListModal = [];
  completedSubtasksModal = [];
}

/**
 * Gibt den Wert des Subtask-Inputs zurück
 * @returns {string} Trimmed Input-Wert
 */
function getSubtaskInputValue() {
  const subInput = document.getElementById("subtask-modal");
  return subInput?.value.trim() || "";
}

/**
 * Leert das Subtask-Input-Feld
 */
function clearSubtaskInput() {
  const subInput = document.getElementById("subtask-modal");
  if (subInput) subInput.value = "";
}

/**
 * Fügt einen neuen Subtask hinzu
 * @param {Event} event - Click-Event
 */
export function addSubtaskModal(event) {
  event.preventDefault();
  const value = getSubtaskInputValue();
  if (!value) return;

  addSubtaskToList(value);
  clearSubtaskInput();
  renderSubtasksModal();
}

/**
 * Fügt Subtask zur Liste hinzu
 * @param {string} value - Subtask-Text
 */
function addSubtaskToList(value) {
  subtaskItemsListModal.push(value);
  completedSubtasksModal.push(false);
}

/**
 * Behandelt Enter-Taste für Subtask-Hinzufügung
 * @param {KeyboardEvent} event - Keyboard-Event
 */
export function addSubtaskOnEnterModal(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtaskModal(event);
  }
}

/**
 * Rendert die Subtasks im Modal
 */
export function renderSubtasksModal() {
  const list = document.getElementById("subtaskList-modal");
  if (!list) return;

  clearSubtaskList(list);
  renderSubtaskItems(list);
  attachAllEventListeners(list);
}

/**
 * Leert die Subtask-Liste
 * @param {HTMLElement} list - Listen-Element
 */
function clearSubtaskList(list) {
  list.innerHTML = "";
}

/**
 * Rendert alle Subtask-Items
 * @param {HTMLElement} list - Listen-Element
 */
function renderSubtaskItems(list) {
  subtaskItemsListModal.forEach((text, index) => {
    const subtaskElement = createSubtaskElement(text, index);
    list.appendChild(subtaskElement);
  });
}

/**
 * Erstellt ein Subtask-Element
 * @param {string} text - Subtask-Text
 * @param {number} index - Index des Subtasks
 * @returns {HTMLElement} Subtask-Element
 */
function createSubtaskElement(text, index) {
  const container = document.createElement("div");
  container.innerHTML = getSubtaskHTML(text, index);
  return container.firstElementChild;
}

/**
 * Bindet alle Event-Listener
 * @param {HTMLElement} list - Listen-Element
 */
function attachAllEventListeners(list) {
  attachDeleteListeners(list);
  attachEditListeners(list);
  attachCheckboxListeners(list);
}

/**
 * Bindet Delete-Event-Listener
 * @param {HTMLElement} list - Listen-Element
 */
function attachDeleteListeners(list) {
  const deleteButtons = list.querySelectorAll("[data-del]");
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.dataset.del);
      deleteSubtask(index);
    });
  });
}

/**
 * Löscht einen Subtask
 * @param {number} index - Index des zu löschenden Subtasks
 */
function deleteSubtask(index) {
  subtaskItemsListModal.splice(index, 1);
  completedSubtasksModal.splice(index, 1);
  renderSubtasksModal();
}

/**
 * Bindet Edit-Event-Listener
 * @param {HTMLElement} list - Listen-Element
 */
function attachEditListeners(list) {
  const editButtons = list.querySelectorAll("[data-edit]");
  editButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.dataset.edit);
      makeSubtaskEditableModal(index);
    });
  });
}

/**
 * Bindet Checkbox-Event-Listener
 * @param {HTMLElement} list - Listen-Element
 */
function attachCheckboxListeners(list) {
  const checkboxes = list.querySelectorAll(".subtask-checkbox-modal");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
      const index = parseInt(event.target.dataset.index);
      completedSubtasksModal[index] = event.target.checked;
    });
  });
}

/**
 * Macht einen Subtask editierbar
 * @param {number} index - Index des zu editierenden Subtasks
 */
function makeSubtaskEditableModal(index) {
  const item = getSubtaskElement(index);
  if (!item) return;

  replaceWithEditTemplate(item, index);
  attachEditModeListeners(item, index);
}

/**
 * Holt das Subtask-Element
 * @param {number} index - Index des Elements
 * @returns {HTMLElement|null} Subtask-Element
 */
function getSubtaskElement(index) {
  const list = document.getElementById("subtaskList-modal");
  return list?.children[index] || null;
}

/**
 * Ersetzt Element mit Edit-Template
 * @param {HTMLElement} item - Zu ersetzendes Element
 * @param {number} index - Index des Subtasks
 */
function replaceWithEditTemplate(item, index) {
  const currentText = subtaskItemsListModal[index];
  item.innerHTML = getEditableSubtaskTemplate(currentText);
}

/**
 * Bindet Edit-Mode Event-Listener
 * @param {HTMLElement} container - Container-Element
 * @param {number} index - Index des Subtasks
 */
function attachEditModeListeners(container, index) {
  const input = container.querySelector("input");
  const saveBtn = container.querySelector("[data-save]");
  const deleteBtn = container.querySelector("[data-del]");

  attachSaveListener(saveBtn, input, index);
  attachDeleteListener(deleteBtn, index);
}

/**
 * Bindet Save-Event-Listener
 * @param {HTMLElement} saveBtn - Save-Button
 * @param {HTMLElement} input - Input-Element
 * @param {number} index - Index des Subtasks
 */
function attachSaveListener(saveBtn, input, index) {
  if (!saveBtn) return;
  
  saveBtn.addEventListener("click", () => {
    saveSubtaskEdit(input, index);
  });
}

/**
 * Speichert Subtask-Bearbeitung
 * @param {HTMLElement} input - Input-Element
 * @param {number} index - Index des Subtasks
 */
function saveSubtaskEdit(input, index) {
  subtaskItemsListModal[index] = input.value.trim();
  renderSubtasksModal();
}

/**
 * Bindet Delete-Event-Listener für Edit-Mode
 * @param {HTMLElement} deleteBtn - Delete-Button
 * @param {number} index - Index des Subtasks
 */
function attachDeleteListener(deleteBtn, index) {
  if (!deleteBtn) return;
  
  deleteBtn.addEventListener("click", () => {
    deleteSubtask(index);
  });
}

/**
 * Aktualisiert Subtasks mit neuen Daten
 * @param {Array} subtasks - Array der Subtasks
 * @param {Array} subtaskDone - Array der abgeschlossenen Status
 */
export function updateSubtasks(subtasks = [], subtaskDone = []) {
  subtaskItemsListModal = [...subtasks];
  completedSubtasksModal = createCompletedArray(subtasks, subtaskDone);
}

/**
 * Erstellt Array für abgeschlossene Subtasks
 * @param {Array} subtasks - Array der Subtasks
 * @param {Array} subtaskDone - Array der abgeschlossenen Status
 * @returns {Array} Array der abgeschlossenen Status
 */
function createCompletedArray(subtasks, subtaskDone) {
  const hasValidDoneArray = subtaskDone.length === subtasks.length;
  return hasValidDoneArray ? [...subtaskDone] : new Array(subtasks.length).fill(false);
}
