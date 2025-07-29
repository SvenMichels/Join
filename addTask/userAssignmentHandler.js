/**
 * User Assignment Management for Add Task
 * Handles assigning users to a task during creation.
 *
 * @module userAssignmentHandler
 */

import { getUserCheckboxTemplate } from "./addtasktemplates.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";

let allSystemUsers = [];

/**
 * Returns the list of all loaded system users.
 *
 * @returns {Array<Object>} List of users
 */
export function getAllSystemUsers() {
  return allSystemUsers;
}

/**
 * Loads users from backend and renders them in the checkbox list.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsers() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsers = contacts;
    renderUserCheckboxes(allSystemUsers);
  } catch (error) {
    console.error("Error loading contacts for add task:", error);
    allSystemUsers = [];
  }
}

/**
 * Renders user checkboxes inside the DOM container.
 *
 * @param {Array<Object>} users - User data list
 * @param {Array<string>} [preselected=[]] - Optional list of preselected usernames
 */
export function renderUserCheckboxes(users, preselected = []) {
  const container = clearAndPrepareContainer("assignedUserList");
  if (!container) return;

  addUniqueCheckboxes(users, preselected, container);
  updateSelectedUserDisplay();
}

/**
 * Clears and returns the checkbox container element.
 *
 * @param {string} id - DOM ID
 * @returns {HTMLElement|null}
 */
function clearAndPrepareContainer(id) {
  const container = document.getElementById(id);
  if (!container) return null;
  container.innerHTML = "";
  return container;
}

/**
 * Adds unique checkbox elements for users.
 *
 * @param {Array<Object>} users - All users
 * @param {Array<string>} preSelected - Preselected users
 * @param {HTMLElement} container - Parent DOM node
 */
function addUniqueCheckboxes(users, preSelected, container) {
  const uniqueNames = new Set();

  users.forEach(user => {
    if (uniqueNames.has(user.userFullName)) return;
    uniqueNames.add(user.userFullName);

    const isChecked = preSelected.includes(user.userFullName);
    const checkboxElement = createUserCheckboxElement(user, isChecked);
    container.appendChild(checkboxElement);
  });
}

/**
 * Creates a checkbox HTML element for a user.
 *
 * @param {Object} user - User object
 * @param {boolean} isChecked - Whether the checkbox should be checked
 * @returns {HTMLElement} Checkbox element wrapper
 */
function createUserCheckboxElement(user, isChecked) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper";
  if (isChecked) wrapper.classList.add("active");

  wrapper.innerHTML = getUserCheckboxTemplate(user, isChecked);
  attachCheckboxListener(wrapper);
  return wrapper;
}

/**
 * Adds click listener to checkbox wrapper.
 *
 * @param {HTMLElement} wrapper - Wrapper element
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");

  wrapper.addEventListener("click", (e) => {
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
    wrapper.classList.toggle("active", checkbox.checked);
    updateSelectedUserDisplay();
  });
}

/**
 * Updates the visual display of selected user chips.
 */
export function updateSelectedUserDisplay() {
  const selectedContainer = document.getElementById("selectedUser");
  if (!selectedContainer) return;

  selectedContainer.innerHTML = "";
  collectAssignedUsers().forEach(name => {
    const user = allSystemUsers.find(u => u.userFullName === name);
    const chip = createUserChip(user, name);
    selectedContainer.appendChild(chip);
  });
}

/**
 * Creates a visual chip element for a user.
 *
 * @param {Object} user - User object
 * @param {string} name - Username fallback
 * @returns {HTMLElement} Chip element
 */
function createUserChip(user, name) {
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(name);
  return chip;
}

/**
 * Returns a list of currently assigned users.
 *
 * @returns {Array<string>} List of usernames
 */
function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map(cb => cb.value);
}

/**
 * Clears all selected user checkboxes and chips.
 */
export function clearSelectedUsers() {
  const selectedUserContainer = document.getElementById("selectedUser");
  if (selectedUserContainer) {
    selectedUserContainer.innerHTML = "";
  }

  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.closest('.user-checkbox-wrapper')?.classList.remove('active');
  });
}

/**
 * Toggles the visibility of the user assignment list.
 *
 * @param {Event} clickEvent - Button click event
 */
export function toggleUserAssignmentList(clickEvent) {
  clickEvent.preventDefault();
  const userAssignmentList = document.getElementById("assignedUserList");
  const arrowIndicator = document.getElementById("assignedBtnImg");
  const isListVisible = userAssignmentList.classList.toggle("visible");
  arrowIndicator?.classList.toggle("rotated", isListVisible);
}

/**
 * Sets up the user search input and filters the user list.
 */
export function setupUserSearch() {
  const searchBar = document.getElementById("searchUser");
  searchBar?.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    if (term.length < 3) {
      if (!term.length) renderUserCheckboxes(allSystemUsers);
      return;
    }
    document.getElementById("assignedUserList").classList.add("visible");
    renderUserCheckboxes(
      allSystemUsers.filter(u => u.userFullName.toLowerCase().includes(term))
    );
  });
}
