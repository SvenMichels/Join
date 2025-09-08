/**
 * @fileoverview Generates HTML templates for subtasks and user checkboxes in the task modal.
 * Provides utilities to render subtasks (view and edit mode) and user assignment elements.
 * @module taskfloatHTML
 */

import { getCompletedSubtasks } from "./subtaskManager.js";
import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Generates HTML for a subtask item in view mode.
 * Includes checkbox, text, and edit/delete buttons.
 *
 * @param {string} text - The subtask text content.
 * @param {number} index - Index of the subtask in the array.
 * @returns {string} HTML string for the subtask container.
 */
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

/**
 * Generates HTML for a user assignment checkbox element.
 * Includes a styled user chip with initials and a labeled checkbox.
 *
 * @param {Object} user - User object containing name and style info.
 * @param {string} user.userFullName - Full name of the user.
 * @param {string} [user.userId] - Optional unique user ID (used in checkbox ID).
 * @param {string} [user.userColor] - CSS class for background color.
 * @param {string} [user.userInitials] - Optional precomputed initials.
 * @returns {string} HTML string for user checkbox UI.
 */
export function getUserCheckboxHTML(user) {
  if (!user || !user.userFullName) {
    return '<div class="error">Invalid user data</div>';
  }

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

/**
 * Generates HTML template for a subtask in editable mode.
 * Includes a text input, save, and delete buttons.
 *
 * @param {string} value - The current value of the subtask.
 * @returns {string} HTML string for editable subtask input UI.
 */
export function getEditableSubtaskTemplate(value) {
  return `
    <input type="text" class="subtask-text-input-modal" value="${value}" id="subtaskEditModal" placeholder="Enter subtask" />
    <div class="subtask-button-wrapper-modal">
      <button class="subtask-delete-button-modal" data-del>
        <img class="subtask-delete-button-images-modal" src="../assets/icons/delete.svg" />
      </button>
      <div class="subtask-spacer-modal"></div>
      <button class="subtask-save-button-modal" data-save>
        <img class="subtask-delete-button-images-modal" src="../assets/icons/check.svg" />
      </button>
      <div class="hint-container">
      <div id="subtaskEditModalHint" class="hint-bubble"></div>
      </div>
    </div>
  `;
}