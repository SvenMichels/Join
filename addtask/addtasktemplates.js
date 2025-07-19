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
