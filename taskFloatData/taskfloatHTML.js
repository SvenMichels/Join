import { getCompletedSubtasks } from "./subtaskManager.js";
import { getInitials } from "../scripts/utils/helpers.js";

export function getSubtaskHTML(text, index) {
  const completedSubtasks = getCompletedSubtasks();
  const checked = completedSubtasks[index] ? "checked" : "";
  return `
    <div class="subtask-container-modal">
      <input type="checkbox" class="subtask-checkbox-modal" data-index="${index}" ${checked}>
      <p class="subtask-display-text-modal">${text}</p>
      <div class="subtask-controls-modal">
        <button class="subtask-edit-button-modal" data-edit="${index}">
          <img class="subtask-edit-button-images-modal" src="../assets/icons/edit.svg" />
        </button>
        <div class="subtask-spacer-second-modal"></div>
        <button class="subtask-delete-button-second-modal" data-del="${index}">
          <img class="subtask-edit-button-images-modal" src="../assets/icons/delete.svg" />
        </button>
      </div>
    </div>
  `;
}

export function getUserCheckboxHTML(user) {
  const checkboxId = `user-checkbox-modal-${user.userId || user.userFullName.replace(/\s+/g, '-').toLowerCase()}`;
  
  return `
    <div class="user-info-wrapper">
      <div class="selected-contact-chip ${user.userColor || 'color-1'}">
        ${user.userInitials || getInitials(user.userFullName)}
      </div>
      <label for="${checkboxId}">${user.userFullName}</label>
    </div>
    <input type="checkbox" id="${checkboxId}" class="user-checkbox-modal" value="${user.userFullName}">
  `;
}

export function getEditableSubtaskTemplate(value) {
  return `
    <input type="text" class="subtask-text-input-modal" value="${value}">
    <div class="subtask-button-wrapper-modal">
      <button class="subtask-delete-button-modal" data-del>
        <img class="subtask-delete-button-images-modal" src="../assets/icons/delete.svg" />
      </button>
      <div class="subtask-spacer-modal"></div>
      <button class="subtask-save-button-modal" data-save>
        <img class="subtask-delete-button-images-modal" src="../assets/icons/check.svg" />
      </button>
    </div>
  `;
}