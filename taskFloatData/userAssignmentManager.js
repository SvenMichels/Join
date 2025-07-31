/**
 * @fileoverview User Assignment Management for Task Modal.
 * Handles loading, rendering, selection, and search of users to assign tasks.
 * @module userAssignmentManager
 */

import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";
import { getUserCheckboxHTML } from "./taskfloatHTML.js";
import { getInitials } from "../scripts/utils/helpers.js";

let allSystemUsersModal = [];

/**
 * Loads and renders user checkboxes in the modal.
 * Always reloads contacts to ensure current user's data is displayed.
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsersModal() {
  await loadContactData();
  renderUserCheckboxesModal(allSystemUsersModal);
}

/**
 * Loads contact data from the contact service.
 * Populates the global user array.
 * @private
 */
async function loadContactData() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsersModal = contacts || [];
  } catch (error) {
    allSystemUsersModal = [];
  }
}

/**
 * Renders user checkboxes in the modal.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {Promise<void>}
 */
export async function renderUserCheckboxesModal(users) {
  const container = document.getElementById("assignedUserList-modal");
  if (!container) return;

  renderCheckboxList(container, users);
  handlePendingPreselection();
}

/**
 * Renders the checkbox list in the container.
 * @param {HTMLElement} container - Target DOM container.
 * @param {Array<Object>} users - List of users to render.
 * @private
 */
function renderCheckboxList(container, users) {
  container.innerHTML = "";
  users.forEach(user => {
    const checkboxElement = createUserCheckboxElement(user);
    container.appendChild(checkboxElement);
  });
}

/**
 * Applies any pending preselection of users.
 * @private
 */
function handlePendingPreselection() {
  if (window.pendingAssignedUsers) {
    applyUserPreselection(window.pendingAssignedUsers);
    window.pendingAssignedUsers = null;
  } else {
    updateSelectedModal();
  }
}

/**
 * Applies a predefined user selection to the checkboxes.
 * @param {Array<string>} assignedUsers - User names to select.
 */
export function applyUserPreselection(assignedUsers) {
  if (!Array.isArray(assignedUsers)) return;

  resetAllCheckboxes();
  selectAssignedUsers(assignedUsers);
  updateSelectedModal();
}

/**
 * Resets all checkboxes to unchecked state.
 * @private
 */
function resetAllCheckboxes() {
  const checkboxes = document.querySelectorAll(".user-checkbox-modal");
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.closest(".user-checkbox-wrapper-modal")?.classList.remove("active");
  });
}

/**
 * Selects the checkboxes for the given user names.
 * @param {Array<string>} assignedUsers - Array of user names to select.
 * @private
 */
function selectAssignedUsers(assignedUsers) {
  assignedUsers.forEach(userName => {
    const checkbox = document.querySelector(
      `.user-checkbox-modal[value="${userName}"]`
    );
    if (checkbox) {
      activateCheckbox(checkbox);
    }
  });
}

/**
 * Activates and highlights a checkbox wrapper.
 * @param {HTMLInputElement} checkbox - Target checkbox element.
 * @private
 */
function activateCheckbox(checkbox) {
  checkbox.checked = true;
  checkbox.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
}

/**
 * Creates a DOM element for a user checkbox.
 * @param {Object} user - User object.
 * @returns {HTMLElement} Wrapper DOM element.
 * @private
 */
function createUserCheckboxElement(user) {
  const wrapper = createCheckboxWrapper(user);
  attachCheckboxListener(wrapper);
  return wrapper;
}

/**
 * Creates a wrapper for a user checkbox element.
 * @param {Object} user - User object.
 * @returns {HTMLElement} The wrapper DOM element.
 * @private
 */
function createCheckboxWrapper(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper-modal";
  wrapper.innerHTML = getUserCheckboxHTML(user);
  return wrapper;
}

/**
 * Attaches a click listener to a checkbox wrapper.
 * @param {HTMLElement} wrapper - Checkbox wrapper element.
 * @private
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");
  wrapper.addEventListener("click", (event) => {
    handleCheckboxClick(event, checkbox, wrapper);
  });
}

/**
 * Handles the checkbox toggle behavior.
 * @param {Event} event - Click event.
 * @param {HTMLInputElement} checkbox - The checkbox input.
 * @param {HTMLElement} wrapper - The checkbox wrapper.
 * @private
 */
function handleCheckboxClick(event, checkbox, wrapper) {
  if (event.target !== checkbox) {
    checkbox.checked = !checkbox.checked;
  }
  wrapper.classList.toggle("active", checkbox.checked);
  updateSelectedModal();
}

/**
 * Updates the UI to show selected users as colored chips.
 */
export function updateSelectedModal() {
  const container = document.getElementById("selectedUser-modal");
  if (!container) return;

  container.innerHTML = "";
  renderSelectedChips(container);
}

/**
 * Renders selected user chips in the container.
 * @param {HTMLElement} container - Target container for chips.
 * @private
 */
function renderSelectedChips(container) {
  const checkedBoxes = document.querySelectorAll(".user-checkbox-modal:checked");
  checkedBoxes.forEach(checkbox => {
    const chip = createUserChip(checkbox.value);
    container.appendChild(chip);
  });
}

/**
 * Creates a chip for the selected user.
 * @param {string} userName - Name of the user.
 * @returns {HTMLElement} The chip element.
 * @private
 */
function createUserChip(userName) {
  const user = allSystemUsersModal.find(u => u.userFullName === userName);
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(userName);
  return chip;
}

/**
 * Toggles the visibility of the user selection list and rotates the dropdown icon.
 * @param {Event} event - Click event.
 */
export function toggleUserListModal(event) {
  event.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  const assignImg = document.getElementById("assignedBtnImg-modal");

  toggleListVisibility(list, assignImg);
}

/**
 * Toggles list visibility and icon rotation.
 * @param {HTMLElement} list - The user list container.
 * @param {HTMLElement} assignImg - The icon element.
 * @private
 */
function toggleListVisibility(list, assignImg) {
  list.classList.toggle("visible");
  assignImg?.classList.toggle("rotated", list.classList.contains("visible"));
}

/**
 * Initializes the event listener for the user search input field.
 */
export function initUserSearchEventListener() {
  const searchInput = document.getElementById("searchUser-modal");
  if (!searchInput) return;

  searchInput.addEventListener("input", handleSearchInput);
}

/**
 * Handles input change in the user search field.
 * Filters and re-renders user checkboxes.
 * @private
 */
function handleSearchInput() {
  const searchInput = document.getElementById("searchUser-modal");
  const filteredUsers = getFilteredUsers(searchInput.value);
  renderUserCheckboxesModal(filteredUsers);
}

/**
 * Filters users by a search query.
 * @param {string} query - The search query.
 * @returns {Array<Object>} Filtered array of user objects.
 * @private
 */
function getFilteredUsers(query) {
  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) return allSystemUsersModal;

  return allSystemUsersModal.filter(user =>
    user.userFullName.toLowerCase().includes(searchTerm)
  );
}
