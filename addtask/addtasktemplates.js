import { getInitials } from "../scripts/utils/helpers.js";

export function getUserCheckboxTemplate(user, isChecked = false) {
  const checkboxId = `user-checkbox-${user.userId || user.userFullName.replace(/\s+/g, '-').toLowerCase()}`;
  
  return `
    <div class="user-info-wrapper">
      <div class="selected-contact-chip ${user.userColor || 'color-1'}">
        ${user.userInitials || getInitials(user.userFullName)}
      </div>
      <label for="${checkboxId}">${user.userFullName}</label>
    </div>
    <input type="checkbox" id="${checkboxId}" class="user-checkbox" value="${user.userFullName}" ${
    isChecked ? "checked" : ""
  }>
  `;
}

export function getSubtaskControlGroupTemplate() {
  return `
    <button class="subtask-edit-button">
      <img class="subtask-edit-buttonImg" src="../assets/icons/edit.svg" alt="edit">
    </button>
    <div class="subtask-spacer-second"></div>
    <button class="subtask-delete-buttonSecond">
      <img class="subtask-delete-buttonImgSecond" src="../assets/icons/delete.svg" alt="delete">
    </button>`;
}
