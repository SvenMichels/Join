/**
 * Template generators for user checkboxes and subtask control groups.
 * Contains reusable HTML template functions for the Add Task form components.
 * @module addtasktemplates
 */

import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Generates the HTML template for a user selection checkbox.
 *
 * @param {Object} user - The user object containing name, ID, and optionally initials/color.
 * @param {string} user.userFullName - Full name of the user.
 * @param {string} [user.userId] - Optional unique user ID.
 * @param {string} [user.userColor] - Optional color class for the user chip.
 * @param {string} [user.userInitials] - Optional initials (fallbacks to computed initials).
 * @param {boolean} [isChecked=false] - Whether the checkbox should be initially checked.
 * @returns {string} HTML string for rendering the user checkbox.
 */
export function getUserCheckboxTemplate(user, isChecked = false) {
  const checkboxId = `user-checkbox-${user.userId}`;

  return `
    <div class="user-info-wrapper">
      <div class="selected-contact-chip ${user.userColor || 'color-1'}">
        ${user.userInitials || getInitials(user.userFullName)}
      </div>
      <label for="${checkboxId}" id="${checkboxId}-label">${user.userFullName}</label>
    </div>
    <input type="checkbox" id="${checkboxId}" class="user-checkbox" value="${user.userFullName}" ${isChecked ? "checked" : ""
    }>
  `;
}

/**
 * Generates the HTML template for subtask control buttons (edit/delete).
 *
 * @returns {string} HTML string containing edit and delete buttons for a subtask.
 */
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
