import { getInitials } from "../scripts/utils/helpers.js";

export function getUserCheckboxTemplate(user, isChecked) {
  return `
    <div class="user-info-wrapper">
      <div class="selected-contact-chip ${user.colorClass}">
        ${getInitials(user.userName)}
      </div>
      <label>${user.userName}</label>
    </div>
    <input type="checkbox" class="user-checkbox" value="${user.userName}" ${
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
