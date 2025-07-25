/**
 * Subtask Management for Add Task
 * Verwaltung der Subtasks
 */

import { getSubtaskControlGroupTemplate } from "./addtasktemplates.js";
import { getSubtaskItems, addSubtaskItem, removeSubtaskItem, updateSubtaskItem } from "./formManager.js";

export function addNewSubtask(element) {
  element.preventDefault();
  const subtaskInput = document.getElementById("subtask");
  const subtaskInputValue = subtaskInput?.value.trim();
  if (!subtaskInputValue) return;
  
  addSubtaskItem(subtaskInputValue);
  subtaskInput.value = "";
  renderSubtasks();
}

export function addSubtaskOnEnterKey(element) {
  if (element.key === "Enter") {
    element.preventDefault();
    addNewSubtask(element);
  }
}

export function renderSubtasks() {
  const list = document.getElementById("subtaskList");
  if (!list) return;
  
  list.innerHTML = "";
  const subtasks = getSubtaskItems();

  subtasks.forEach((text, index) => {
    const container = createSubtaskContainer(text, index);
    list.appendChild(container);
  });
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
    removeSubtaskItem(index);
    renderSubtasks();
  });
}

function makeSubtaskEditable(index) {
  const list = document.getElementById("subtaskList");
  const container = list.children[index];
  if (!container) return;
  
  const subtasks = getSubtaskItems();
  container.innerHTML = "";

  const input = createSubtaskInput(subtasks[index]);
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
    updateSubtaskItem(index, input.value.trim());
    renderSubtasks();
  });

  const deleteBtn = createIconButton("delete.svg", "subtask-delete-button", () => {
    removeSubtaskItem(index);
    renderSubtasks();
  });

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
